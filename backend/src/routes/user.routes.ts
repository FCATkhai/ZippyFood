import express from 'express';
import {
    createUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    logoutUser,
    upgradeToRestaurantOwner
} from '../controllers/user.controller';
import { authorize } from '../middleware/auth.middleware';
import { USER_GROUPS } from '../config/constants';

const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/logout', authorize(USER_GROUPS.ALL_USERS), logoutUser);

router.post('/upgrade', authorize(USER_GROUPS.CUSTOMER_ADMIN), upgradeToRestaurantOwner);

// test auth middleware
router.get('/profile', authorize(USER_GROUPS.ADMIN_ONLY), (req, res) => {
    console.log(req.body);
    res.json({ message: "User authenticated", user: req.user });
});

router.get('/:id', getUserById);
router.put('/:id', authorize(USER_GROUPS.ALL_USERS), updateUser);
router.delete('/:id', authorize(USER_GROUPS.ADMIN_ONLY), deleteUser);


router.get('/', authorize(USER_GROUPS.ADMIN_ONLY), getUsers);

export default router;
