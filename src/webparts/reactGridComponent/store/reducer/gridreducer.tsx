import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Grid_FetchData, Grid_Add, Grid_Editing, Grid_Delete } from '../action/gridaction';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { GridInitialState } from '../../../../grid-data';

interface RootState {
    data: any; // Define your data type
    error: boolean;
    result: any[]; // Define your result type
    count: number;
}

const initialState: RootState = {
    data: GridInitialState.dataSource,
    error: false,
    result: [],
    count: 0,
}

const applyFiltering = (query: Query, filter: any) => {
    // Apply filtering based on direct filter conditions
    for (let i = 0; i < filter.length; i++) {
        const { fn, e } = filter[i];
        if (fn === 'onWhere') {
            query.where(e);
        }
    }
}

const applySearching = (query: Query, search: any) => {
    // Check if a search operation is requested
    if (search && search.length > 0) {
      // Extract the search key and fields from the search array
      const { fields, key } = search[0];
      // perform search operation using the field and key on the query
      query.search(key, fields);
    }
  }

const applySorting = (query: Query, sorted: any[]) => {
    // Check if sorting data is available
    if (sorted && sorted.length > 0) {
      // Iterate through each sorting info
      sorted.forEach(sort => {
          // Get the sort field name either by name or field
        const sortField = sort.name || sort.field;
        // Perform sort operation using the query based on the field name and direction
        query.sortBy(sortField as string, sort.direction);
      });
    }
  }

const applyPaging = (query: any, page: any) => {
    // Check if both 'take' and 'skip' values are available
    if (page.take && page.skip) {
      // Calculate pageSkip and pageTake values to get pageIndex and pageSize
      const pageSkip = page.skip / page.take + 1;
      const pageTake = page.take;
      query.page(pageSkip, pageTake);
    }
    // If if only 'take' is available and 'skip' is 0, apply paging for the first page.
    else if (page.skip === 0 && page.take) {
      query.page(1, page.take);
    }
  }

const applyGrouping = (query: Query, group: Object[]) => {
    // Check if grouping data is available
    if (group && group.length > 0) {
      for (let i = 0; i < group.length; i++) {
        // perform group operation using the column on the query
        query.group(group[i] as string);
      }
    }
  }


const applyLazyLoad = (query: Query, payload: any) => {
    // Configure lazy loading for the main data
    if (payload.isLazyLoad) {
      query.lazyLoad.push({ key: 'isLazyLoad', value: true });
      // If on-demand group loading is enabled, configure lazy loading for grouped data
      if (payload.onDemandGroupInfo) {
        query.lazyLoad.push({
            key: 'onDemandGroupInfo',
            value: payload.action.lazyLoadQuery,
        });
      }
    }
  }

const gridReducer = (state = initialState, action: any) => {
    const dataSource = [...initialState.data];
    const gridData = new DataManager(dataSource);
    let filter = [];
    const query = new Query();

    switch (action.type) {
        case Grid_FetchData:
            // filter
            if (action.payload.where || action.payload.action.requestType === "stringfilterrequest") {
                applyFiltering(query, action.gridQuery.queries);
            }
            // search
            if (action.payload.search) {
                applySearching(query, action.gridQuery.queries);
            }
            // sort
            if (!isNullOrUndefined(action.payload.sorted)) {
                applySorting(query, action.payload.sorted);
            }
            // group
            if (!isNullOrUndefined(action.payload.group)) {
                applyGrouping(query, action.payload.group);
            }
            // lazy load group
            applyLazyLoad(query, action.payload);
            // paging
            applyPaging(query, action.payload);
            // To get the count of the data
            query.isCountRequired = true;
            // Execute local data operations using the provided query
            const currentResult = new DataManager(dataSource).executeLocal(query);
            // Return the result along with the count of total records
            return ({
                data: {
                    result: (currentResult as any).result, // Result of the data
                    count: (currentResult as any).count // Total record count
                }
            })        
        case Grid_Add: {
            // Here, we will perform the insert action using the DataManager
            gridData.insert(action.payload.data, '', undefined);
            const addedData = gridData.executeLocal(new Query());
            // Update the original state.
            initialState.data = [...addedData];
            const count = addedData.length;
            const result = new DataManager(addedData).executeLocal(action.gridQuery);
            // Execute the grid page query based on your skip and take values.
            const currentPageData = new DataManager(result).executeLocal(new Query().skip(action.payload.state.skip).take(action.payload.state.take));
            // We need to return the grid data as result and count with object type.
            return ({
                data: { result: currentPageData, count: filter.length ? result.length : count },
            })
        }
        case Grid_Editing: {
            // Here, we are going to perform update action by using the DataManager.
            gridData.update('OrderID', action.payload.data);
            const updatedData = gridData.executeLocal(new Query());
            // Update the original state.
            initialState.data = [...updatedData];
            const count = updatedData.length;
            const result = new DataManager(updatedData).executeLocal(action.gridQuery);
            // Execute the grid page query based on your skip and take values.
            const currentPageData = new DataManager(result).executeLocal(new Query().skip(action.payload.state.skip).take(action.payload.state.take));
            // We need to return the grid data as result and count with object type.
            return ({
                data: { result: currentPageData, count: filter.length ? result.length : count }
            })
        }
        case Grid_Delete: {
            // Here, we will perform the delete action by using DataManager.
            gridData.remove('OrderID', { OrderID: action.payload.data[0]['OrderID'] });
            const updatedData = gridData.executeLocal(new Query());
            // Update the original state.
            initialState.data = [...updatedData];
            const count = updatedData.length;
            const result = new DataManager(updatedData).executeLocal(action.gridQuery);
            // Execute the grid page query based on your skip and take values.
            const currentPageData = new DataManager(result).executeLocal(new Query().skip(action.payload.state.skip).take(action.payload.state.take));
            // We need to return the grid data as result and count with object type.
            return ({
                data: { result: currentPageData, count: filter.length ? result.length : count }
            })
        }
        default:
            query.page(1, GridInitialState.pageSettings?.pageSize as number);
            query.isCountRequired = true;
            const defaultResult: any = new DataManager(dataSource).executeLocal(query);
            return {
                data: {
                    result: defaultResult.result, count: defaultResult.count,
                },
            };
    }
};

export default gridReducer;