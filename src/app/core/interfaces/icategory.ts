import { IBusiness } from "./ibusiness";

export interface ICategory {
    categoryId:        number;
    name:      string;
    businesses: IBusiness[]; 
    
}
