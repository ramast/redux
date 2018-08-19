Hi,
I've been doing lot of work with React/Redux that involve lot of API calls to an external backend.

The way you do that for each API you need to do the following
1. Store variables to hold API call status (pending, in progress, succeeded, failed), variable to hold returned data and another one to hold any returned errors.
2. Actions to trigger API fetching data plus other actions to handle response from backend.
3. Reducer to consume these actions

Repeating this again and again for each API is error prone and difficult to maintain on the long run so I decided to create 3 news classes `AjaxData`, `AjaxAction` and `AjaxReducer`.

`AjaxData` is an Immutable class that inherit from (Record)[https://facebook.github.io/immutable-js/docs/#/Record] and contain 4 attributes (status, data, error and context)

If you create instance of that Record for your API then you have place to store you API call status, returned data, returned errors and any extra context you want to keep track of.

`AjaxData` can be used by itself without the need of the other two classes.

`AjaxAction` class provide the common Action functions you need when performing an API call.
For example instead of doing

    const POST_LIST_LOAD_SUCCESS = "POST_LIST_LOAD_SUCCESS"
    const POST_LIST_IS_LOADING = "POST_LIST_IS_LOADING"

    function is_loading() {
       return {type: POST_LIST_IS_LOADING}
    }

    function is_load_success() {
       return {type: POST_LIST_IS_LOAD_SUCCESS}
    }

You can do

    const POST_LIST = new AjaxAction("POST_LIST")

Then you automatically have

    POST_LIST.loaded()
    POST_LIST.loading()

which will return 

    {type: "POST_LIST_LOADED"}
    {type: "POST_LIST_LOADING"}

Then in the reducer you can handle `POST_LIST.LOADED` and `POST_LIST.LOADING` constants instead of  `POST_LIST_LOAD_SUCCESS` and `POST_LIST_IS_LOADING`.

`AjaxAction` can also be used standalone without the need for the other two classes.

Finally we have `AjaxReducer` which require that you use both `AjaxData` and `AjaxAction`. Also you must be using immutableJS for your store.

`AjaxReducer` instance automatically handle `AjaxAction`'s actions and update the corresponding `AjaxData` instance.

Of course most of the time you will want to customize the behavior of the two classes `AjaxAction` and `AjaxReducer`
which you can do by means of inheritance and override the method you want to customize.

This is not a final project yet and need your feedback and suggestions before properly packaging and releasing it