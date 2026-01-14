import { IProduct } from "./IProduct";
import { User } from "src/contexts/AuthContext";

export interface IAppContext {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    cart: IProduct[];

    setLogin: (user: User, token: string) => void;
    logout: () => void;
    addProductToCart: (product: IProduct) => void;
    removeProductFromCart: (id: number) => void;
    clearCart: () => void;
    getProductsQuantity: () => number;
    isIncludedInCart: (id: number) => boolean;
    getCartTotal: () => number;
    authAction: (func: () => void)=> void;
    getCartDiscount:() => number;
    getCartFinalTotal:() => number;

}
