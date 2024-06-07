import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './ReactGridComponent.module.scss';
import type { IReactGridComponentProps } from './IReactGridComponentProps';
import { escape } from '@microsoft/sp-lodash-subset';
import {
  ColumnDirective, ColumnsDirective, DataSourceChangedEventArgs, DataStateChangeEventArgs,
  Edit, Filter, GridComponent, Group, Inject, LazyLoadGroup, Page, Sort, Toolbar,
} from '@syncfusion/ej2-react-grids';
import { Provider } from 'react-redux';
import store from '../store/gridstore';
import { updateRow, deleteRow, addRow, fetchData } from '../store/action/gridaction';
import { GridInitialState } from '../../../grid-data';

const ReactGridComponent: React.FC<IReactGridComponentProps> = (props) => {
  const {
    description,
    isDarkTheme,
    environmentMessage,
    hasTeamsContext,
    userDisplayName
  } = props;

  const gridInstance = useRef<GridComponent | null>(null);
  const [gridData, setGridData] = useState(store.getState().data);
  const editOptions = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal', newRowPosition: 'Top' };
  const toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
  const groupSettings = { enableLazyLoading: true, showGroupedColumn: true };

  const dataSourceChanged = (state: DataSourceChangedEventArgs) => {
    const query = (gridInstance as any).current.getDataModule().generateQuery();
    if (state.requestType === "save") {
      if (state.action === "add") {
        store.dispatch(addRow(state, query)); // Dispatch the adding action.
        (state as any).endEdit()
      } else if (state.action === "edit") {
        store.dispatch(updateRow(state, query)); // Dispatch the editing action.
        (state as any).endEdit();
      }
    }
    if (state.requestType === 'delete') {
      store.dispatch(deleteRow(state, query)); // Dispatch the deleting action.
      (state as any).endEdit();
    }
  }
  const dataStateChange = (state: DataStateChangeEventArgs) => {
    const query = (gridInstance as any).current.getDataModule().generateQuery();
    store.dispatch(fetchData(state, query));
    setGridData(store.getState().data);
  }
  useEffect(() => {
    // Update grid's dataSource when Redux state changes
    if (gridInstance.current) {
      gridInstance.current.dataSource = gridData;
    }
  }, [gridData]);

  return (
    <Provider store={store}>
      <section className={`${styles.reactGridComponent} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Well done, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
          <div>Web part property value: <strong>{escape(description)}</strong></div>
        </div>
        <div>
          <h3>Welcome to React Grid component in the SharePoint Framework!</h3>
          <p>
            The SharePoint Framework (SPFx) is a extensibility model for Microsoft Viva, Microsoft Teams and SharePoint. It&#39;s the easiest way to extend Microsoft 365 with automatic Single Sign On, automatic hosting and industry standard tooling.
          </p>
          <h4>Learn more about SPFx development:</h4>
          <ul className={styles.links}>
            <li><a href="https://aka.ms/spfx" target="_blank" rel="noreferrer">SharePoint Framework Overview</a></li>
            <li><a href="https://aka.ms/spfx-yeoman-graph" target="_blank" rel="noreferrer">Use Microsoft Graph in your solution</a></li>
            <li><a href="https://aka.ms/spfx-yeoman-teams" target="_blank" rel="noreferrer">Build for Microsoft Teams using SharePoint Framework</a></li>
            <li><a href="https://aka.ms/spfx-yeoman-viva" target="_blank" rel="noreferrer">Build for Microsoft Viva Connections using SharePoint Framework</a></li>
            <li><a href="https://aka.ms/spfx-yeoman-store" target="_blank" rel="noreferrer">Publish SharePoint Framework applications to the marketplace</a></li>
            <li><a href="https://aka.ms/spfx-yeoman-api" target="_blank" rel="noreferrer">SharePoint Framework API reference</a></li>
            <li><a href="https://aka.ms/m365pnp" target="_blank" rel="noreferrer">Microsoft 365 Developer Community</a></li>
          </ul>
        </div>
        <link rel="stylesheet" href="https://cdn.syncfusion.com/ej2/25.2.3/fluent.css" />
        <div>
          <GridComponent id='grid' ref={gridInstance} allowFiltering={true} allowSorting={true} allowPaging={true} pageSettings={GridInitialState.pageSettings}
            allowGrouping={true} groupSettings={groupSettings} editSettings={editOptions} toolbar={toolbarOptions}
            dataSourceChanged={dataSourceChanged.bind(this)} dataStateChange={dataStateChange.bind(this)} height={300}>
            <ColumnsDirective>
              <ColumnDirective field='OrderID' isPrimaryKey={true} width='90' />
              <ColumnDirective field='CustomerID' width='100' />
              <ColumnDirective field='ProductName' width='120' />
            </ColumnsDirective>
            <Inject services={[Filter, Sort, Group, LazyLoadGroup, Page, Edit, Toolbar]} />
          </GridComponent>
        </div>
      </section>
    </Provider>
  );
}
export default ReactGridComponent;
