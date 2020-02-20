const initState = {
    posts: [
        { id: '1', title: 'Sick', body: 'dope' },
        { id: '2', title: 'Sick', body: 'dope' },
        { id: '3', title: 'Sick', body: 'dope' },
    ],
};

const rootReducer = (state = initState, action) => {
    console.log('action', action);

    if (action.type === 'DELETE_POST') {
        let newPosts = state.posts.filter(post => {
            return action.id !== post.id;
        });

        return {
            ...state,
            posts: newPosts,
        };
    }

    return state;
};

export default rootReducer;
