import QtQuick 2.5
import "main.js" as App

Item {
    // property string searchText
    //
    // ListView {
    //     model: query
    // }
    //
    // Query {
    //     id: query
    //     where: searchText ? ['title = ?', searchText] : []
    //     sortBy: 'title'
    // }
    //
    // function addDocument(title, body) {
    //     var document = new Model.SampleDocument()
    //     document.title = title
    //     document.body = body
    //     document.save()
    // }

    Component.onCompleted: {
        var documents = App.SampleDocument.find()
        console.log(documents[0].id, documents[0].title, documents[0].body)
    }
}
