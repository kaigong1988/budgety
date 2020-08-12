let budgetController = (function () {
  // add function constructor to make expense and income prototype classes:
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // create a data structure of an object that stores all the data into arrays
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  // return a public method
  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // create new ID which the new ID will equal to the previous entry's ID (current length of the exp/inc array before newItem gets pushed) minus 1.
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new Item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      };

      // push it to the data object
      data.allItems[type].push(newItem);

      // return the newItem that other module have access to it
      return newItem;
    },

    testing: function () {
      console.log(data);
    }
  }

})();



// UI CONTROLLER///////////////////////////////////////////////////////////////////
let UIController = (function() {
  // create DOMstrings object to point its value to the HTML/CSS class values incase of future changing of the HTML/CSS file (renaming the class names)
  let DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list', // select div id for html to append to
    expensesContainer: '.expenses__list'
  };

  // returns an object containing:
  return  {
    // a public method that returns an object that contains all the input data that collected from the HTML file by using querySelector to call the class names
    getIput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    // a public method which can manipulate the HTML and DOM
    addListItem: function (obj, type) {
      var html, newHtml, element;
      // create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer; // select a div id to append the html
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer; // select a div id to append the html
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      };

      // replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // insert the HTML to the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    // a public method which will clear the fields after the input data has been added to the UI
    clearFields: function () {
      var fields, fieldsArr;
      // select all the fields that we want to clear by selecting the class id
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // will return a list (not array) of DOM strings

      fieldsArr = Array.prototype.slice.call(fields); // use Array.protoype to call the slice function to make the list of DOM strings that selected to an array

      // using higher order function to clear all the fields that selected by turning into empty string
      fieldsArr.forEach(function(current, index, array) {
        current.value = ""; // .value is the value property of the input field
      });

      // sets the focus back to the description input field
      fields[0].focus();
    },

    // a function that contains DOMstrings that let outter function to have the access of DOMstrings
    getDOMstrings: function () {
      return DOMstrings;
    }
  };
})();




//GLOBAL APP CONTROLLER////////////////////////////////////////////////////////////
let controller = (function(budgetCtrl, UICtrl) {
  // set up an eventlistener function to organize all the eventlisters into one function
  var setupEventlisteners = function () {
    var DOM = UICtrl.getDOMstrings();

    // add eventhandler to collect the data from UICtrl(call ctrlAddItem function) once 'add button' is clicked
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    // add eventhandler to collect the data from UICtrl(call ctrlAddItem function) once enter key is pressed
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function () {

    // 1. Calculate the budget

    // 2. Return the budget

    // 3. Display the budget on the UI

  }

  // collecting the input data from UICtrl(UIController)
  var ctrlAddItem = function () {
    var input, newItem;

    // 1. get the field input data
    input = UICtrl.getIput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. clear the input fields
      UICtrl.clearFields();

      // 5. calculate and update the budget
      updateBudget();
    }
  };

  // return an object with an init function that can invoke the setupEventlistener function outside of controller
  return {
    init: function() {
      console.log('application is running');
      setupEventlisteners();
    }
  };

})(budgetController, UIController);

// invoke the setupEventlistener function outside of the controller to initialized the whole application
controller.init();