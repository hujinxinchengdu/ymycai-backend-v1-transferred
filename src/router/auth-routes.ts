import { Request, Response, NextFunction, Router } from 'express';
import { userProfile } from '../controllers';
import { authMiddleware } from '../configuration';

const authRouter = Router();

/**
 * @route POST /user/profile
 * @description 获取用户个人资料。如果用户尚未创建，会先创建一个用户资料然后返回。
 *
 * @returns {UserProfileModel} 用户资料
 */
authRouter.post(
  '/profile',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userProfile((req as any).user);

      return res.status(200).json({
        status: 200,
        message: 'Successfully saved or retrieved user',
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export { authRouter };
