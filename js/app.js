(function () {

    'use strict';

    var ENTER = 13;
    var STR_KEY = "notes";

    function ToDoApp(store) {

        this.store = store;
        this.storedNotes = [];
        this.insert = $('#insertNote');
        this.list = $('#noteList');
        this.filterDiv = $('#filterDiv');
        this.addEventListeners();
        this.init();

    }

    var proto = ToDoApp.prototype;

    /**
     * Checks if there are any notes in localstorage and if present, renders them
     */
    proto.init = function () {
        var nts = this.storageHelper().getNotesFromStore(this.store, STR_KEY);
        this.storedNotes = nts;
        if (nts) {
            for (var i = 0; i < nts.length; i++) {
                this.list.append(this.createNode(this.storedNotes[i]));
            }
        }
    };

    /**
     * shows items in a particular state: all, complete or incomplete
     */
    proto.filterByState = function (event) {

        var allItems = Array.prototype.slice.call(this.list.children('li'));
        var btn = event.target;
        var action = btn.id;

        $('#noteList').find('li').removeClass("hidden");
        $('#filterDiv').find('button').removeClass('active').addClass('btn-circ');
        $(btn).addClass('active');

        for (var i = 0; i < allItems.length; i++) {
            var anItem = (allItems[i]);
            if (action == 'complete') {
                !$(anItem).hasClass('completed') && $(anItem).addClass("hidden");
            } else if (action == 'incomplete') {
                $(anItem).hasClass('completed') && $(anItem).addClass("hidden");
            }
        }
    };

    /**
     * Captures key press event on text box and
     *  calls createNode to add new item to list
     */
    proto.insertItem = function (event) {
        var element = event.target;
        var text = element.value.trim();
        if (text && event.keyCode === ENTER) {
            var item = {
                text: text,
                completed: false,
                id: +new Date()
            };
            this.storedNotes.push(item);
            this.list.append(this.createNode(item).hide("fast").slideDown("fast"));
            this.storageHelper().setItemInStore(STR_KEY, this.storedNotes);
            element.value = '';
        }
    };

    /**
     * creates a new html node for a new item
     */
    proto.createNode = function (item) {
        var isItmComplete = item.completed;

        var node = $('<li/>')
            .attr("id", item.id)
            .toggleClass('completed', isItmComplete);

        var  inputId = "chk" + ( +new Date());
        var chk = $('<input/>')
            .attr("type", "checkbox")
            .attr("id", inputId)
            .prop("checked", isItmComplete);

        var input = $('<input/>')
            .attr("type", "text")
            .addClass("edit")
            .val(item.text);

        var label = $("<label/>")
            .text(item.text)
           .attr("for",inputId);

        var del = $("<i/>").addClass("fa fa-trash-o delItem");
        var div = $('<div/>');

        div.append(chk);
        div.append(label);
        div.append(input);
        div.append(del);
        node.append(div);

        return node;
    };

    /**
     * marks items as complete or incomplete
     */
    proto.toggleItem = function (event) {
        var clickedItm = event.target;
        var liItem = $(clickedItm).closest("li");

        liItem && liItem.toggleClass("completed");
        this.storageHelper().updateStorage(this.storedNotes, $(liItem).attr("id"), false, $(liItem).hasClass("completed"),null);

    };

    /**
     * deletes an item
     */
    proto.deleteItem = function (event) {
        var clickedItm = event.target;
        var liItem = $(clickedItm).closest("li");

        this.storageHelper().updateStorage(this.storedNotes, $(liItem).attr("id"), true, null,null);
        liItem && liItem.slideUp("fast",function(){
            liItem.remove();
        });

    };

    /**
     * edits an item
     */
    proto.editItem = function(event) {

        var liItem = $(event.target).closest("li");
        var editLabel =$(liItem).find("label");
        var editInput = $(liItem).find(".edit");

        liItem.addClass("editing");
        editInput.focus();
        var that =this;
        editInput.on("keypress", function (event) {

            if (event.keyCode === ENTER) {
                editLabel.text(editInput.val());
                liItem.removeClass("editing");
                that.storageHelper().updateStorage(that.storedNotes, $(liItem).attr("id"), false, null,editInput.val());
            }

        })
    }

    /**
     * Event listeners for various user actions
     */
    proto.addEventListeners = function () {
        this.insert.on("keypress", this.insertItem.bind(this));
        this.list.on("click", "input[type=checkbox]", this.toggleItem.bind(this));
        this.list.on("click", "i", this.deleteItem.bind(this));
        this.list.on("dblclick", "div", this.editItem.bind(this)) ;
        this.filterDiv.on("click", "button", this.filterByState.bind(this));

    };


    /**
     * Storage Helper - to fetch/store items to and from localstorage
     */
    proto.storageHelper = function () {
        var getItemIndById = function (id, allNotes) {
                for (var i = 0; i < allNotes.length; i++) {
                    if (allNotes[i].id == id) {
                        return i;
                    }
                }
            },
            setItemInStore = function (key, value) {
                localStorage.setItem(key,  JSON.stringify(value));
            },
            getNotesFromStore = function (localStore, key) {

                return localStore && localStore.getItem(key) && JSON.parse(localStore.getItem(key)) || [];
            },
            updateStorage = function (allNotes, id, isRemove, isComplete,txt) {
                var i = getItemIndById(id, allNotes);
                if (isRemove) {
                    allNotes.splice(i, 1);
                } else if(isComplete!=null) {
                    allNotes[i].completed = isComplete;
                }else if(txt){
                    allNotes[i].text = txt ;
                }
                localStorage.setItem(STR_KEY, JSON.stringify(allNotes));
            };

        return {
            setItemInStore: setItemInStore,
            getNotesFromStore: getNotesFromStore,
            updateStorage: updateStorage

        };

    };


    $(document).ready(function () {

        var app = new ToDoApp(localStorage);
    });
})();
