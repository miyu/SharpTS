/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Program__ = __webpack_require__(1);

window.onload = () => __WEBPACK_IMPORTED_MODULE_0__Program__["a" /* Program */].Main([]);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export createOutRefParam */
class OutRefParam {
    constructor(read, write) {
        this.read = read;
        this.write = write;
    }
}
/* unused harmony export OutRefParam */

function createOutRefParam(read, write) { return new OutRefParam(read, write); }
class SharpJsHelpers {
    static conditionalAccess(val, next) {
        return val ? next(val) : null;
    }
    static valueClone(val) {
        if (!val || typeof val !== 'object')
            return val;
        if (val.zzz__sharpjs_clone)
            return val.zzz__sharpjs_clone();
        return val;
    }
    static arrayClear(arr) {
        while (arr.length)
            arr.pop();
    }
    static TestTypeCheck(x, type) {
        if (type === 'object')
            return typeof (x) == 'object' || x instanceof Object || x == null;
        if (type === 'string')
            return typeof (x) == 'string' || x instanceof String;
        if (typeof (type) === 'string')
            return typeof (x) == type;
        if (typeof (type) === 'function')
            return x instanceof type;
        return false;
    }
    static readThenExec(read, exec) {
        const res = read();
        exec(res);
        return res;
    }
    static booleanXor(x, y) {
        return x != y && (x || y);
    }
    static setCapacity(arr, capacity) {
        if (arr.length > capacity)
            arr.length = capacity;
        return capacity;
    }
    static tryBinaryOperator(a, b, op, fallback) {
        return (op in a) ? a[op](b) : fallback(a, b);
    }
}
class Program {
    constructor(...args) {
    }
    static Main(args) {
        console.log("Hello, World!");
        let age = Program.PromptAge();
        console.log("You are " + age + " years old!");
        return 0;
    }
    static PromptAge() {
        console.log("How old are you?");
        return parseInt(prompt("Enter String Input:"));
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Program;

eval("if (!module.parent) Program.Main(process.argv.slice(1))");


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjkyZGI1MzA0YzRmNTdhMTcxMjciLCJ3ZWJwYWNrOi8vLy4vTWFpbi50cyIsIndlYnBhY2s6Ly8vLi9Qcm9ncmFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQzdEb0M7QUFDcEMsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyx5REFBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Ozs7Ozs7O0FDQWpDO0lBQ0gsWUFBb0IsSUFBYSxFQUFTLEtBQW9CO1FBQTFDLFNBQUksR0FBSixJQUFJLENBQVM7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFlO0lBQUksQ0FBQztDQUNyRTtBQUFBO0FBQUE7QUFDSywyQkFBK0IsSUFBYSxFQUFFLEtBQW9CLElBQW9CLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBSSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBR3JJO0lBQ0csTUFBTSxDQUFDLGlCQUFpQixDQUFPLEdBQU0sRUFBRSxJQUFrQjtRQUN0RCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNq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QUFrQixDQUFDLENBQUM7UUFDaEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FFSDtBQUFBO0FBQUE7QUFFRCxJQUFJLENBQUMseURBQXlELENBQUMsQ0FBQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAyOTJkYjUzMDRjNGY1N2ExNzEyNyIsImltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuL1Byb2dyYW0nO1xyXG53aW5kb3cub25sb2FkID0gKCkgPT4gUHJvZ3JhbS5NYWluKFtdKTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vTWFpbi50cyIsIi8qIFNoYXJwSlMgLSBFbWl0dGVkIG9uIDEyLzE0LzIwMTcgMjoxOTozNyBBTSAqL1xyXG5leHBvcnQgY2xhc3MgT3V0UmVmUGFyYW08VD4geyBcclxuICAgY29uc3RydWN0b3IgKHB1YmxpYyByZWFkOiAoKSA9PiBULCBwdWJsaWMgd3JpdGU6ICh2YWw6IFQpID0+IFQpIHsgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPdXRSZWZQYXJhbTxUPihyZWFkOiAoKSA9PiBULCB3cml0ZTogKHZhbDogVCkgPT4gVCk6IE91dFJlZlBhcmFtPFQ+IHsgcmV0dXJuIG5ldyBPdXRSZWZQYXJhbTxUPihyZWFkLCB3cml0ZSk7IH1cclxuXHJcbmludGVyZmFjZSBJQ29tcGFyZXI8VD4geyBDb21wYXJlKGEgOiBULCBiIDogVCk6IG51bWJlcjsgfVxyXG5jbGFzcyBTaGFycEpzSGVscGVycyB7IFxyXG4gICBzdGF0aWMgY29uZGl0aW9uYWxBY2Nlc3M8VCwgUj4odmFsOiBULCBuZXh0IDogKHg6IFQpID0+IFIpIDogUiB8IG51bGwgeyBcclxuICAgICAgcmV0dXJuIHZhbCA/IG5leHQodmFsKSA6IG51bGw7XHJcbiAgIH1cclxuICAgc3RhdGljIHZhbHVlQ2xvbmU8VD4odmFsOiBUKTogVCB7IFxyXG4gICAgICBpZiAoIXZhbCB8fCB0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIHZhbDtcclxuICAgICAgaWYgKCg8YW55PnZhbCkuenp6X19zaGFycGpzX2Nsb25lKSByZXR1cm4gKDxhbnk+dmFsKS56enpfX3NoYXJwanNfY2xvbmUoKTtcclxuICAgICAgcmV0dXJuIHZhbDtcclxuICAgfVxyXG4gICBzdGF0aWMgYXJyYXlDbGVhcjxUPihhcnI6IEFycmF5PFQ+KTogdm9pZCB7IFxyXG4gICAgICB3aGlsZShhcnIubGVuZ3RoKSBhcnIucG9wKCk7XHJcbiAgIH1cclxuICAgc3RhdGljIFRlc3RUeXBlQ2hlY2s8VD4oeDogVCwgdHlwZTogc3RyaW5nIHwgRnVuY3Rpb24pIHtcclxuICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSByZXR1cm4gdHlwZW9mKHgpID09ICdvYmplY3QnIHx8IDxhbnk+eCBpbnN0YW5jZW9mIE9iamVjdCB8fCA8YW55PnggPT0gbnVsbDtcclxuICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSByZXR1cm4gdHlwZW9mKHgpID09ICdzdHJpbmcnIHx8IDxhbnk+eCBpbnN0YW5jZW9mIFN0cmluZztcclxuICAgICAgaWYgKHR5cGVvZih0eXBlKSA9PT0gJ3N0cmluZycpIHJldHVybiB0eXBlb2YoeCkgPT0gdHlwZTtcclxuICAgICAgaWYgKHR5cGVvZih0eXBlKSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIDxhbnk+eCBpbnN0YW5jZW9mIHR5cGU7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgfVxyXG4gICBzdGF0aWMgcmVhZFRoZW5FeGVjPFQ+KHJlYWQ6ICgpID0+IFQsIGV4ZWM6ICh2YWw6IFQpID0+IHZvaWQgKTogVCB7XHJcbiAgICAgIGNvbnN0IHJlcyA6IFQgPSByZWFkKCk7XHJcbiAgICAgIGV4ZWMocmVzKTtcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgfVxyXG4gICBzdGF0aWMgYm9vbGVhblhvcih4OiBib29sZWFuLCB5OiBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB4ICE9IHkgJiYgKHggfHwgeSk7XHJcbiAgIH1cclxuICAgc3RhdGljIHNldENhcGFjaXR5PFQ+KGFycjogQXJyYXk8VD4sIGNhcGFjaXR5OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBpZiAoYXJyLmxlbmd0aCA+IGNhcGFjaXR5KSBhcnIubGVuZ3RoID0gY2FwYWNpdHk7IC8vIGRvbid0IHJlc2l6ZSB1cHdhcmQuXHJcbiAgICAgIHJldHVybiBjYXBhY2l0eTtcclxuICAgfVxyXG4gICBzdGF0aWMgdHJ5QmluYXJ5T3BlcmF0b3I8VCwgUj4oYTogVCwgYjogVCwgb3A6IHN0cmluZywgZmFsbGJhY2s6IChhOiBULCBiOiBUKSA9PiBSKSB7XHJcbiAgICAgIHJldHVybiAob3AgaW4gPGFueT5hKSA/ICg8YW55PmEpW29wXShiKSA6IGZhbGxiYWNrKGEsIGIpO1xyXG4gICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUHJvZ3JhbSB7XHJcbiAgIGNvbnN0cnVjdG9yKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgIH1cclxuICAgXHJcbiAgIHB1YmxpYyBzdGF0aWMgTWFpbihhcmdzIDogc3RyaW5nW10pIDogbnVtYmVyIHtcclxuICAgICAgY29uc29sZS5sb2coXCJIZWxsbywgV29ybGQhXCIpO1xyXG4gICAgICBsZXQgYWdlIDogbnVtYmVyID0gUHJvZ3JhbS5Qcm9tcHRBZ2UoKTtcclxuICAgICAgY29uc29sZS5sb2coXCJZb3UgYXJlIFwiICsgYWdlICsgXCIgeWVhcnMgb2xkIVwiKTtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgIH1cclxuICAgXHJcbiAgIHB1YmxpYyBzdGF0aWMgUHJvbXB0QWdlKCkgOiBudW1iZXIge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkhvdyBvbGQgYXJlIHlvdT9cIik7XHJcbiAgICAgIHJldHVybiBwYXJzZUludChwcm9tcHQoXCJFbnRlciBTdHJpbmcgSW5wdXQ6XCIpKTtcclxuICAgfVxyXG4gICBcclxufVxyXG5cclxuZXZhbChcImlmICghbW9kdWxlLnBhcmVudCkgUHJvZ3JhbS5NYWluKHByb2Nlc3MuYXJndi5zbGljZSgxKSlcIik7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL1Byb2dyYW0udHMiXSwic291cmNlUm9vdCI6IiJ9