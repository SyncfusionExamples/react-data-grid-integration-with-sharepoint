import { Query } from "@syncfusion/ej2-data";

export const Grid_FetchData = 'Grid_FetchData';
export const Grid_Add = "Grid_Add";
export const Grid_Delete = "Grid_Delete";
export const Grid_Editing = "Grid_Editing";
export const Grid_Paging = "Grid_Paging";

// Define your action creator
export const fetchData = (state: any, query?: Query) => {
  return {
    type: Grid_FetchData,
    payload: state,
    gridQuery: query
  };
};

// Action for adding
export const addRow = (state: any , query: any) => ({
  type: Grid_Add,
  payload: state,
  gridQuery: query
});

// Action for deleting  
export const deleteRow = (state: any , query: any) => ({
  type: Grid_Delete,
  payload: state,
  gridQuery: query
});

// Action for editing
export const updateRow = (state: any , query: any) => ({
  type: Grid_Editing,
  payload: state,
  gridQuery: query
});