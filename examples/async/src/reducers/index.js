import { combineReducers } from 'redux'
import { AjaxData, AJAX_STATUS } from "../ooredux"
import {
  SELECT_SUBREDDIT, INVALIDATE_SUBREDDIT,
  REQUEST_POSTS, RECEIVE_POSTS
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
    case INVALIDATE_SUBREDDIT:
      return state.set("status", AJAX_STATUS.needs_reload)
    case REQUEST_POSTS:
      return state.set("status", AJAX_STATUS.loading)
    case RECEIVE_POSTS:
      //AjaxData class contain 3 primary entries (data, status and context)
      //Context is useful for storing any addition information beside what was returned by the backend
      return state.merge({
        status: AJAX_STATUS.loaded,
        data: action.posts,
        context: {lastUpdated: action.receivedAt}
      })
    default:
      return state
  }
}

const postsBySubreddit = (state = { }, action) => {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return {
        ...state,
        [action.subreddit]: posts(state[action.subreddit], action)
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
