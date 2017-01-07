let fs = require('fs');

let dirs = ['./src', './src/sass','./src/sass/modules', './src/sass/components', './src/js', './src/inc', './src/img'];

let files = [
    {
        name: './src/index.html',
        content: ''
    },
    {
        name: './src/inc/head.html',
        content: ''
    },
    {
        name: './src/inc/header.html',
        content: ''
    },
    {
        name: './src/inc/scripts.html',
        content: ''
    },
    {
        name: './src/inc/styles.html',
        content: ''
    },
    {
        name: './src/inc/pagination.html',
        content: ''
    },
    {
        name: './src/inc/breadcrumbs.html',
        content: ''
    },
    {
        name: './src/js/scripts.js',
        content: ''
    },
    {
        name: './src/sass/styles.sass',
        content: `
@import 'modules/modules'
@import 'components/components'
        `
    },
    {
        name: './src/sass/modules/_modules.sass',
        content: ''
    },
    {
        name: './src/sass/components/_components.sass',
        content: ''
    },
];

dirs.forEach(function (item) {
    if (!fs.existsSync(item)){
        fs.mkdirSync(item);
        console.log(`folder '${item}' was created!`);
    }else{
        console.log(`folder '${item}' already exist!`);
    }
});
files.forEach(function (item) {
    fs.writeFile(item.name, item.content, (err) => {
        if (err) throw err;
    console.log(`${item.name} was created`);
});
});