import { AppDataSource } from '../configuration';
import { Company, Watchlist, WatchlistToCompany } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { getCompanyIdFromSymbol } from './util/get-company-by-symbol';

//创建一个默认的自选股列表
const createDefaultWatchlist = async (userId: string) => {
  const watchlist = new Watchlist();
  watchlist.name = 'Default Watchlist';
  watchlist.user_id = userId;
  watchlist.watchlist_id = uuidv4();

  await AppDataSource.manager.save(Watchlist, watchlist);

  const defaultCompanies = ['AAPL', 'MSFT'];
  for (let i = 0; i < defaultCompanies.length; i++) {
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: defaultCompanies[i] },
    });
    if (company) {
      const watchlistToCompany = new WatchlistToCompany();
      watchlistToCompany.watchlist_id = watchlist.watchlist_id;
      watchlistToCompany.company_id = company.company_id;
      watchlistToCompany.sortOrder = i + 1; // Setting order starting from 1
      await AppDataSource.manager.save(WatchlistToCompany, watchlistToCompany);
    }
  }
};

//用户自定义的创建一个新的自选股列表, 每个用户最多创建10个自选股列表
const createNewWatchlist = async (
  userId: string,
  watchlistName: string,
): Promise<string> => {
  // Find the number of watchlists already associated with the user
  const watchlistCount = await AppDataSource.manager.count(Watchlist, {
    where: { user_id: userId },
  });

  // Check if the user has already reached the limit of 10 watchlists
  if (watchlistCount >= 10) {
    return 'You have reached the maximum number of watchlists. Cannot create more.';
  }
  console.log(watchlistName, userId);

  // Create a new watchlist for the user
  const newWatchlist = new Watchlist();
  newWatchlist.name = watchlistName;
  newWatchlist.user_id = userId;
  newWatchlist.watchlist_id = uuidv4();

  await AppDataSource.manager.save(Watchlist, newWatchlist);

  return 'New watchlist successfully created.';
};

//将公司添加到特定的自选股列表
const addCompanyToWatchlist = async (
  watchlistName: string,
  companySymbol: string,
): Promise<string> => {
  // Build a single query to add a company to the watchlist if it doesn't already exist
  const watchlist = await AppDataSource.manager.findOne(Watchlist, {
    where: { name: watchlistName },
  });
  const company = await AppDataSource.manager.findOne(Company, {
    where: { company_symbol: companySymbol },
  });

  if (!watchlist || !company) {
    return 'Invalid watchlist or company ID.';
  }

  let result = await AppDataSource.createQueryBuilder()
    .insert()
    .into(WatchlistToCompany)
    .values({
      watchlist_id: watchlist.watchlist_id,
      company_id: company.company_id,
      // Assuming you still want to manage the order outside of this function
      // Alternatively, you could count existing records in a sub-query
      sortOrder: () =>
        '(SELECT COALESCE(MAX(sort_order), 0) + 1 FROM watchlist_to_company WHERE watchlist_id = :watchlistId)',
    })
    .setParameter('watchlistId', watchlist.watchlist_id)
    .orIgnore() // This will ignore the insert operation if a duplicate exists
    .execute();

  if (result.identifiers.length === 0) {
    return 'Company already exists in the watchlist or invalid watchlist/user.';
  }

  return 'Company successfully added to watchlist.';
};

// 删除特定自选股列表
const deleteWatchlist = async (
  userId: string,
  watchlistId: string,
): Promise<string> => {
  // First, delete all WatchlistToCompany entries that reference the watchlist
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(WatchlistToCompany)
    .where('watchlist_id = :watchlistId', { watchlistId })
    .execute();

  // Then, delete the Watchlist itself
  const result = await AppDataSource.createQueryBuilder()
    .delete()
    .from(Watchlist)
    .where('watchlist_id = :watchlistId AND user_id = :userId', {
      watchlistId,
      userId,
    })
    .execute();

  if (result.affected === 0) {
    return 'Watchlist not found or you do not have permission to delete it.';
  }

  return 'Watchlist and its associated companies successfully deleted.';
};

/**
 * 从特定自选股列表中删除公司, 没有进行order的重新排序操作
 *  */
const removeCompanyFromWatchlist = async (
  userId: string,
  watchlistId: string,
  companyId: string,
): Promise<string> => {
  const result = await AppDataSource.createQueryBuilder()
    .delete()
    .from(WatchlistToCompany)
    .where('watchlist_id = :watchlistId AND company_id = :companyId', {
      watchlistId,
      companyId,
    })
    .execute();

  if (result.affected === 0) {
    return 'Company not found in the watchlist or you do not have permission to remove it.';
  }

  return 'Company successfully removed from watchlist.';
};

//对特定的自选股列表排序, 我会用一个messagequeue来调用这个方法, 删除完之后发一个message给后端有空闲的时候来执行, 这里是基本实现可能需要优化
const reorderCompaniesInWatchlist = async (
  watchlistId: string,
): Promise<string> => {
  // 首先获取watchlist内的所有公司，并按照当前的'order'字段进行排序
  const companiesInWatchlist = await AppDataSource.createQueryBuilder(
    WatchlistToCompany,
    'wtc',
  )
    .where('wtc.watchlist_id = :watchlistId', { watchlistId })
    .orderBy('wtc.order', 'ASC')
    .getMany();

  if (companiesInWatchlist.length === 0) {
    return 'No companies found in the watchlist or invalid watchlist ID.';
  }

  // 使用事务来保证排序操作的原子性
  await AppDataSource.transaction(async (transactionalEntityManager) => {
    let newOrder = 1; // 重新排序开始的起始位置
    for (const company of companiesInWatchlist) {
      company.sortOrder = newOrder;
      await transactionalEntityManager.save(WatchlistToCompany, company);
      newOrder++;
    }
  });

  return 'Companies successfully reordered in watchlist.';
};

const getUserWatchlists = async (userId: string): Promise<any> => {
  const userWatchlists = await AppDataSource.manager.find(Watchlist, {
    where: { user_id: userId },
    relations: ['companyConnection', 'companyConnection.company'], // Make sure to also load companies
  });

  const result = userWatchlists.map((watchlist) => {
    return {
      watchlistId: watchlist.watchlist_id,
      watchlistName: watchlist.name,
      companies: watchlist.companyConnection
        ? watchlist.companyConnection.map(
            (companyConn) => companyConn?.company?.company_symbol ?? 'N/A', // Safely navigate
          )
        : [], // If companyConnection is null, return an empty array
    };
  });

  return result;
};

export {
  createDefaultWatchlist,
  addCompanyToWatchlist,
  createNewWatchlist,
  deleteWatchlist,
  reorderCompaniesInWatchlist,
  removeCompanyFromWatchlist,
  getUserWatchlists,
};
