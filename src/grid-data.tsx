import { createLazyLoadData,  lazyLoadData, } from './datasource';
import { GridModel } from '@syncfusion/ej2-react-grids'

createLazyLoadData();

export const GridInitialState: GridModel  = {
    dataSource:  lazyLoadData,
    pageSettings: { pageSize: 12 , pageSizes:true, pageCount:4},
};
