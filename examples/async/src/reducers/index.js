import  Immutable from "immutable"
import {AjaxData, AjaxReducer, registerAjaxReducers} from "../ooredux"
import { SELECT_SUBREDDIT, AC_POST_LIST } from '../actions'

const initialState = new Immutable.Map({selectedSubreddit: 'reactjs', postsBySubreddit: new Immutable.Map({})})

let actionsMap = {
  [SELECT_SUBREDDIT]: (state, action) => state.set("selectedSubreddit", action.subreddit)
}

class PostsReducer extends AjaxReducer {
  constructor() {
    super(AC_POST_LIST)
  }

  get_store_name(state, action) {
    return ["postsBySubreddit", action.context.subreddit]
}

  handleLoading(state, action) {
    //Need to ensure an AjaxData entry already exist for this subreddit before loading
    const store_name = this.get_store_name(state, action)
    if (!state.hasIn(store_name)) {
      state = state.setIn(store_name, new AjaxData())
    }
    //Let the original reducer handle the loading action
    return super.handleLoading(state, action)
  }

  handleLoaded(state, action) {
    //By default AjaxData context is recorded only once when API call is being made.
    //We override `handleLoaded` to force updating context to include the receivedAt variable
    state = state.mergeIn(this.get_store_name(state, action), {context: action.context})
    return super.handleLoaded(state , action)
  }
}

const postReducer = new PostsReducer()

/*
  This function will take current actionsMap and return new one.
  The new action map would contain default handler for all actions supported by the reducer class.
 */
actionsMap = registerAjaxReducers(actionsMap, [postReducer])

export default function reducer(state = initialState, action = {}) {
    const fn = actionsMap[action.type];
    return fn ? fn(state, action) : state;
}
