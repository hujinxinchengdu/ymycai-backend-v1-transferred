import { AppDataSource } from '../configuration';
import { User, Watchlist, WatchlistToCompany, Company } from '../models';
import { createDefaultWatchlist } from './watchlist-usercase';

const userProfile = async (userFromAuth0: any): Promise<User> => {
  let user = await AppDataSource.manager.findOne(User, {
    where: { auth0Id: userFromAuth0.sub },
  });

  if (!user) {
    user = new User();
    user.user_id = userFromAuth0.sub;
    user.auth0Id = userFromAuth0.sub;
    user.email = userFromAuth0.email;
    user.emailVerified = userFromAuth0.email_verified;
    user.username = userFromAuth0.nickname;
    user.signup_time = new Date();
    user.update_time = userFromAuth0.updated_at;

    await AppDataSource.manager.save(User, user);

    // Create a default watchlist for the user
    await createDefaultWatchlist(user.user_id);
  }

  return user;
};

export { userProfile };
