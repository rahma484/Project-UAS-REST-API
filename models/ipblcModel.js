const createItem = (item)=>{
    return{
        title : item.title,
        overview : item.description,
        background : item.thumbnail
    }
}

module.exports = createItem