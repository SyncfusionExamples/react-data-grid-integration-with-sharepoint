import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import gridReducer from './reducer/gridreducer';

const store = createStore(gridReducer, applyMiddleware(thunk));

export default store;

