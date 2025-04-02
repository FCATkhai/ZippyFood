import mongoose, {Schema, Model} from 'mongoose';
import { ICategory } from '~/shared/interface';
const CategorySchema: Schema = new Schema({
    /* Giúp chủ nhà hàng tạo và quản lý nhóm món ăn */
    restaurant_id: {
        type: Schema.Types.ObjectId, ref: "Restaurant", required: true,
    },
    name: {
        type: String, require: true
    },
    description: {
        type: String
    }
});

const Category:Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;