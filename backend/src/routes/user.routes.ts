import express from 'express';
import {
    createUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    logoutUser,
    changePassword,
    upgradeToRestaurantOwner,
    addAddress,
    updateAddress,
    deleteAddress
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
router.put('/:id', authorize(USER_GROUPS.CUSTOMER_ADMIN), updateUser);
router.patch('/:id', authorize(USER_GROUPS.ALL_USERS), updateUser);
router.patch('/:id/change-password', authorize(USER_GROUPS.ALL_USERS), changePassword);
router.delete('/:id', authorize(USER_GROUPS.ADMIN_ONLY), deleteUser);

// address route
router.post("/:id/addresses", authorize(USER_GROUPS.ALL_USERS), addAddress);
router.put("/:id/addresses/:index", authorize(USER_GROUPS.ALL_USERS), updateAddress);
router.delete("/:id/addresses/:index", authorize(USER_GROUPS.ALL_USERS), deleteAddress);


router.get('/', authorize(USER_GROUPS.ADMIN_ONLY), getUsers);

export default router;
