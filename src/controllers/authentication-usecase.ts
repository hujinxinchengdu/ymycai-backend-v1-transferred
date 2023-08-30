import { AppDataSource } from '../configuration';
import { User, Watchlist, WatchlistToCompany, Company } from '../models';

const userProfile = async (userFromAuth0: any): Promise<User> => {
  let user = await AppDataSource.manager.findOne(User, {
    where: { auth0Id: userFromAuth0.sub },
  });

  if (!user) {
    user = new User();
    user.auth0Id = userFromAuth0.sub;
    user.email = userFromAuth0.email;
    user.emailVerified = userFromAuth0.email_verified;
    user.username = userFromAuth0.nickname;
    user.signup_time = new Date();
    user.update_time = userFromAuth0.updated_at;
    await AppDataSource.manager.save(User, user);

    // 创建一个新的watchlist并保存
    const watchlist = new Watchlist();
    watchlist.name = 'Default Watchlist';
    watchlist.user_id = user.user_id;

    await AppDataSource.manager.save(Watchlist, watchlist);

    // 找到AAPL和MSFT的company_id
    const apple = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: 'AAPL' },
    });
    const microsoft = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: 'MSFT' },
    });

    if (apple && microsoft) {
      // 创建WatchlistToCompany连接并保存
      const watchlistToApple = new WatchlistToCompany();
      watchlistToApple.watchlist_id = watchlist.watchlist_id;
      watchlistToApple.company_id = apple.company_id;
      watchlistToApple.order = 1;
      await AppDataSource.manager.save(WatchlistToCompany, watchlistToApple);

      const watchlistToMicrosoft = new WatchlistToCompany();
      watchlistToMicrosoft.watchlist_id = watchlist.watchlist_id;
      watchlistToMicrosoft.company_id = microsoft.company_id;
      watchlistToMicrosoft.order = 2;
      await AppDataSource.manager.save(
        WatchlistToCompany,
        watchlistToMicrosoft,
      );
    }
  }

  return user;
};

export { userProfile };
