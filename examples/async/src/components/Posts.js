import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

const Posts = ({posts}) => (
  <ul>
    {posts.map((post, i) =>
      <li key={i}>{post.get("title")}</li>
    )}
  </ul>
)

Posts.propTypes = {
  posts: PropTypes.instanceOf(Immutable.List).isRequired
}

export default Posts
