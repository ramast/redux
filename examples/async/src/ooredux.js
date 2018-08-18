/*
This should've been `impore coreapi from 'coreapi' but UglifyJS library hates it for some reasons.
Most probably because source is using ES which UglifyJS doesn't recognize.
Linking to the build library instead of source
 */
import {Record, Map} from "immutable"
export const AJAX_STATUS = {pending:0, loading:1, loaded:2, error:3, needs_reload:4}

export class AjaxData extends Record({
    data:new Map(), error:new Map(), context:new Map(), status: AJAX_STATUS.pending}) {

    //Define read only properties for shortcuts
    get is_loaded () {
        return this.status === AJAX_STATUS.loaded
    }
    get is_error () {
        return this.status  === AJAX_STATUS.error
    }
    get is_loading () {
        return this.status === AJAX_STATUS.loading
    }
    get is_pending () {
        return this.status  === AJAX_STATUS.pending
    }
    get needs_reload () {
        return this.status  === AJAX_STATUS.needs_reload
    }

    val(key, default_val) {
        /*
         Safe shortcut for this.data.get, it's guaranteed to work even if data was not loaded yet.
         Examples: (Assuming user is an AjaxData instance

         user.val("name", "no_name") //Same as user.data.get("name", "no_name")
         user.val(["company", "name"]) //Same as user.getIn(["data", "company", "name"])
         */
        if (Array.isArray(key)) {
            return this.getIn(["data"].concat(key), default_val)
        } else {
            return this.getIn(["data", key], default_val)
        }
    }
}

export class AjaxAction {

    constructor(action_obj_name) {
        const actions = [
            "LOADING", "LOADED", "ERROR", "RESET", "REQUEST_RELOAD"
        ]
        action_obj_name = action_obj_name.toUpperCase()
        for (let action of actions) {
            this[action] = `${ action_obj_name }_${ action }`
        }
    }

    // noinspection JSMethodCanBeStatic
    perform_ajax_call(context, data) {
        //Override this function to perform your ajax call
        //This function must return a promise
        throw Error("Not implemented, data: " + data)
    }

    load(data, context) {
        return (dispatch) => {
            dispatch(this.loading.bind(this, context)(data))
            this.perform_ajax_call.bind(this, context)(data)
            .then((data) => {
                dispatch(this.loaded.bind(this, context)(data))
            })
            .catch((error) => {
                dispatch(this.error.bind(this, context)(error))
            })
        }
    }

    loading(context, data) {
        return {type: this.LOADING, data, context}
    }

    loaded(context, data) {
        return {type: this.LOADED, data, context}
    }

    error(context, error) {
        return {type: this.ERROR, error, context}
    }

    reset(context = {}) {
        return {type: this.RESET, context}
    }

    request_reload(context = {}) {
        return {type: this.REQUEST_RELOAD, context}
    }
}

export class AjaxReducer {
    constructor(ajaxAction, store_name = null) {
        this.action = ajaxAction
        this.store_name = store_name
    }

    get_store_name(state, action) {
        return [this.store_name]
    }

    // noinspection JSMethodCanBeStatic
    parseError(error_msg) {
        return error_msg
    }

    handleLoaded(state, action) {
        return state.mergeIn(this.get_store_name(state, action),
          {data: action.data, status: AJAX_STATUS.loaded})
    }

    handleLoading(state, action) {
        return state.mergeIn(this.get_store_name(state, action),
          {status: AJAX_STATUS.loading, context: action.context||null})
    }

    handleError(state, action) {
        const error = this.parseError(action.error)
        return state.mergeIn(this.get_store_name(state, action), {error, status: AJAX_STATUS.error})
    }

    handleRequestReload(state, action) {
        return state.mergeIn(this.get_store_name(state, action), {status: AJAX_STATUS.needs_reload})
    }

    handleReset(state, action) {
        const store_name = this.get_store_name(state, action)
        if (state.getIn(store_name).is_pending) {
            //If data has already been reset, no need to reset it twice
            return state
        }
        return state.setIn(store_name, new AjaxData())
    }

    generate_default_actions_map(cur_actions_map) {
        let action = this.action
        Object.assign(cur_actions_map, {
            [action.LOADED]: this.handleLoaded.bind(this),
            [action.LOADING]: this.handleLoading.bind(this),
            [action.ERROR]: this.handleError.bind(this),
            [action.REQUEST_RELOAD]: this.handleRequestReload.bind(this),
            [action.RESET]: this.handleReset.bind(this),
        })
    }
}

export function registerAjaxReducers(actions_map, reducers) {
    //Register all AjaxReducers without overriding any ones added by the user
    let new_map = {}
    reducers.forEach((reducer) => reducer.generate_default_actions_map(new_map))
    return Object.assign(new_map, actions_map)
}
