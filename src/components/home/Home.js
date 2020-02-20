import React from 'react';
import { connect } from 'react-redux';
import { deletePost } from '../../actions/postActions';

const Home = props => {
    console.log(props);

    // this.props.deletePost(this.props.posts[1].id);

    const handleClick = () => {
        props.deletePost(props.posts[2].id);
    };

    return (
        <div>
            <h1>HEY</h1>
            <button onClick={handleClick}>Click Me</button>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        posts: state.posts,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        deletePost: id => {
            dispatch(deletePost(id));
        },
    };
};

// connect redux store to our component - react-redux = glue;
export default connect(mapStateToProps, mapDispatchToProps)(Home);
