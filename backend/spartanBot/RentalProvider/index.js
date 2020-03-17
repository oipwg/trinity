const add = require('./add/add');
const list = require('./list');
const delete_ = require('./delete');

// An array of all the supported input commands
const COMMANDS = [add, list, delete_];

module.exports = async function(options) {

    let to_do = Object.keys(options.to_do.rentalProvider)[0];

    console.log(
        'Options from rentalProvider index.js file',
        Object.keys(options.to_do.rentalProvider)[0]
    );

    // Switch based on user input object
    switch (to_do) {
        case 'add':
            let added = await add(options).then((data)=>{
                return data
            }).catch(err => err);
            return added;
            break;
        case 'list':
            list(options);
            break;
        case 'delete':
            delete_(options);
            break;
    }
};
