import { combineReducers } from 'redux'
import { AjaxData, AJAX_STATUS } from "../ooredux"
import {
  SELECT_SUBREDDIT, AC_POST_LIST
} from '../actions'

const selectedSubreddit = (state = 'reactjs', action) => {
  switch (action.type) {
    case SELECT_SUBREDDIT:
      return action.subreddit
    default:
      return state
  }
}

const posts = (state = new AjaxData(), action) => {
  switch (action.type) {
    case AC_POST_LIST.REQUEST_RELOAD:
      return state.set("status", AJAX_STATUS.needs_reload)
    case AC_POST_LIST.LOADING:
      return state.set("status", AJAX_STATUS.loading)
    case AC_POST_LIST.LOADED:
      //AjaxData class contain 3 primary entries (data, status and context)
      //Context is useful for storing any addition information beside what was returned by the backend
      return state.merge({
        status: AJAX_STATUS.loaded,
        data: action.data,
        context: {lastUpdated: action.context.receivedAt}
      })
    default:
      return state
  }
}

const postsBySubreddit = (state = { }, action) => {
  switch (action.type) {
    case AC_POST_LIST.REQUEST_RELOAD:
    case AC_POST_LIST.LOADING:
    case AC_POST_LIST.LOADED:
      return {
        ...state,
        [action.context.subreddit]: posts(state[action.context.subreddit], action)
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  postsBySubreddit,
  selectedSubreddit
})

export default rootReducer
