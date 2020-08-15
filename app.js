let budgetController = (function () {
  // add function constructor to make expense and income prototype classes:
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // add prototype property to calculate percentage
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }

  };

  // add prototype property to get the percentage data
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  // create a private function to calculate the total income/expenses
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
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
    },
    budget: 0,
    percentage: -1
  };

  // return a public method
  return {
    // create a public method that creates the income/expenses objects based on applying the input data to the object prototype and push the objects to the data object
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

    // public method to delete an item from the data structure
    deleteItem: function(type, id) {
      var ids, index;
      // iterate over the exp/inc array in allItems of data structure, return an array that contains all the item ids, then use indexof to match the ID we received from DOM to find out the index of the method that we want to delete
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);

      // if the ID we selected from DOM matches the id in data structure we remove the item object from data structure
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      };
    },
    // public method using the private function to calculate and return the total income/expenses and percentage
    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      };

    },
    // public method to calculate the expense percentage
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    // public method to get the percentage
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    // public method to store the budget that we calculated
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
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
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: '.budget__title--month'
  };
  // a function to formatting the numbers
  var formatNumber = function(num, type) {
    var numSplit, int, dec, commaInt;
    /*
    + or - sign before number
    exactly 2 decimal points
    comma separating the thousands
    */
    num = Math.abs(num);
    // put 2 decimal numbers after the num
    num = num.toFixed(2);
    // split num into int part and decimal part
    numSplit = num.split('.');
    int = numSplit[0];
    let addComma = function(str) {
      var arr = str.split('');
      for (let i = arr.length - 3; i > 0; i -= 3) {
        arr.splice(i, 0, ',');
      }
      return arr.join('');
    }
    commaInt = addComma(int);
    dec = numSplit[1];

    return (type === 'exp'? '-' : '+') + ' ' + commaInt + '.' + dec;
  };

  // field return a node list not an array so dont have higher order functions, so have create a primitive function "forEach" for the node list.
  var nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
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
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer; // select a div id to append the html
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      };

      // replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // insert the HTML to the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    // public method to remove the item form UI by passing the full itemID (e.g inc-0)
    deleteListItem: function(selectorID) {
      // deleting item from DOM have to select the item ID then, move up to parentNode then delete the child element
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    // a public method which will clear the fields after the input data has been added to the UI
    clearFields: function () {
      var fields, fieldsArr;
      // select all the fields that we want to clear by selecting the class id
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // will return a list (not array) of DOM strings

      fieldsArr = Array.prototype.slice.call(fields); // use Array.protoype to call the slice function to make the list of DOM strings that selected to an array

      // using higher order function to clear all the fields that selected by turning into empty string
      fieldsArr.forEach(function(current, index, array) {
        current.value = ""; // .value is the value property of expense/income obj stored in data obj in budgetcontroller
      });

      // sets the focus back to the description input field
      fields[0].focus();
    },
    // public method to do DOM manipulation to update the budget results in html file
    displayBudget: function(obj) {
      var type;
      obj.budget > 0? type = 'inc' : type = 'exp';
      // data received from budgetController.getBudget()
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    // public method to display the expense percentages in the UI
    displayPercentages: function(percentages) {
      var field = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(field, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }

      });
    },
    // public method to display the date in the top of the UI will call this function in init
    displayDate: function() {
      var now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);
      // using the forEach function created for class lists to toggle(add when without the class remove once have the class) the css class
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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

    // add eventlistener on the parent of all income/expenses to do event delegation to find the item id
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    // add eventlisterner 'change': once the input type changes will call a function which will change the color of the input fields and button
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  // create a function to update the new current budget once add/delete an item
  var updateBudget = function () {

    // 1. Calculate the total income and expenses
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  var updatePercentages = function() {
    // 1. calculate the percentages
    budgetCtrl.calculatePercentages();
    // 2. get percentage from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };
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

      // 6. calculate and update the percentages
      updatePercentages();
    }
  };

  // a private function that will pass in the event object of the eventlistener as the argument
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    // using DOM traversing to move up the DOM to get item id
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      // using the string.split method to split the item id (e.g inc-0) into an array containing the item type and ID
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. update and show the new budget
      updateBudget();
      // 4. calculate and update the percentages
      updatePercentages();

    };
  };

  // return an object with an init function that can invoke the setupEventlistener function outside of controller
  return {
    init: function() {
      console.log('application is running');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventlisteners();
      UICtrl.displayDate();
    }
  };

})(budgetController, UIController);

// invoke the setupEventlistener function outside of the controller to initialized the whole application
controller.init();