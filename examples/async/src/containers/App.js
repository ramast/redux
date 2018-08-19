import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { selectSubreddit, fetchPostsIfNeeded, invalidateSubreddit } from '../actions'
import Picker from '../components/Picker'
import Posts from '../components/Posts'
import {AjaxData} from "../ooredux"

class App extends Component {
  static propTypes = {
    selectedSubreddit: PropTypes.string.isRequired,
    ajaxPost: PropTypes.instanceOf(AjaxData),
    dispatch: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { dispatch, selectedSubreddit } = this.props
    dispatch(fetchPostsIfNeeded(selectedSubreddit))
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedSubreddit !== this.props.selectedSubreddit) {
      const { dispatch, selectedSubreddit } = nextProps
      dispatch(fetchPostsIfNeeded(selectedSubreddit))
    }
  }

  handleChange = nextSubreddit => {
    this.props.dispatch(selectSubreddit(nextSubreddit))
  }

  handleRefreshClick = e => {
    e.preventDefault()

    const { dispatch, selectedSubreddit } = this.props
    dispatch(invalidateSubreddit(selectedSubreddit))
    dispatch(fetchPostsIfNeeded(selectedSubreddit))
  }

  render() {
    const { selectedSubreddit} = this.props
    const ajaxPost = this.props.ajaxPost || new AjaxData()
    const lastUpdated = ajaxPost.getIn(["context", "receivedAt"])
    const isEmpty = ajaxPost.data.isEmpty()
    return (
      <div>
        <Picker value={selectedSubreddit}
                onChange={this.handleChange}
                options={[ 'reactjs', 'frontend' ]} />
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {!ajaxPost.is_loading &&
            <button onClick={this.handleRefreshClick}>
              Refresh
            </button>
          }
        </p>
        {isEmpty
          ? (ajaxPost.is_loading ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <div style={{ opacity: ajaxPost.is_loading ? 0.5 : 1 }}>
              <Posts posts={ajaxPost.data} />
            </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  const selectedSubreddit = state.get("selectedSubreddit")
  const ajaxPost = state.getIn(["postsBySubreddit", selectedSubreddit]) || new AjaxData()

  return {
    selectedSubreddit,
    //ajaxPost is an AjaxData class and it contains all the information we need
    ajaxPost
  }
}

export default connect(mapStateToProps)(App)
