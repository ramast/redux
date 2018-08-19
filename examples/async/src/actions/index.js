import {AjaxAction} from "../ooredux"
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'

export const selectSubreddit = subreddit => ({
  type: SELECT_SUBREDDIT,
  subreddit
})

class PostListAction extends AjaxAction {
  constructor() {
    /*
      The string `"POST_LIST_ACTION"` will be a prefix for all actions related to that class.
      For example when data is loaded, the action POST_LIST_ACTION_LOADED will be sent to the reducer.
      If you intend to create more than one instance of that class then don't implement this method and pass
      the action name directly.
     */
    super("POST_LIST_ACTION")
  }

  perform_ajax_call(context, data) {
    /* This is the only function that you must overwrite in the class AjaxAction and it should return a promise.
       If the promise succeed the "loaded" function is called otherwise the error function is called instead.
       Ideally the promise should return a response object which you can parse later to return the data or
       determine the cause of error.
       In case of `fetch` function, you can not access the data directly from response object.
       Instead, you must call `json()` which also return a promise.
       While AjaxAction class can handle that, I've decided to return the final promise from json() directly to keep -
       the example simple.
    */
    return fetch(`https://www.reddit.com/r/${data.subreddit}.json`).then((response) => response.json())
  }

  loaded(context, json) {
    /*
    Usually you don't need to implement that function unless you want to modify the returned data before -
    passing it to the reducer or want to include extra context info like `receivedAt` in this example.
     */
    let data = json.data.children.map(child => child.data)
    context.receivedAt = Date.now()
    return super.loaded(context, data)
  }
}

//Create instance of the AjaxAction class
export const AC_POST_LIST = new PostListAction()
//Pass subreddit variable as "context" also so that I can tell later which subreddit that returned data belong to
export const fetchPosts = subreddit => AC_POST_LIST.load({subreddit}, {subreddit})
export const invalidateSubreddit = (subreddit) => AC_POST_LIST.request_reload({subreddit})

const shouldFetchPosts = (state, subreddit) => {
  const posts = state.getIn(["postsBySubreddit", subreddit])
  //By default an AjaxData object has status "pending"
  if ((!posts) || posts.is_pending) {
    return true
  }
  if (posts.is_loading) {
    return false
  }
  return posts.needs_reload
}

export const fetchPostsIfNeeded = subreddit => (dispatch, getState) => {
  if (shouldFetchPosts(getState(), subreddit)) {
    return dispatch(fetchPosts(subreddit))
  }
}
