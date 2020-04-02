export const tokenConfig = () => {
    const token = localStorage.getItem('token');

    // headers
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        config.headers['x-auth-token'] = token;
    }

    return config;
};
