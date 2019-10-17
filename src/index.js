function eval() {
    // Do not use eval!!!
    return;
}

///////////////////////////////////////////////////////////////////////////
//
//
//
function applyOpToArguments(p_op, p_arg1, p_arg2) {
	let res = undefined;

	switch(p_op) {
		case '+':
			res = +p_arg1 + +p_arg2;
			break;
		case '-':
			res = p_arg1 - p_arg2;
			break;
		case '*':
			res = p_arg1 * p_arg2;
			break;
		case '/':
			if (p_arg2 == 0)
				throw Error("TypeError: Division by zero.");
			res = p_arg1 / p_arg2;
			break;
	}

	if (res === undefined)
		throw Error("Unknown operation " + p_op);

	return res;
}

///////////////////////////////////////////////////////////////////////////
//
//
//
function calcRPNExpression(p_rpn) {
	let BINARY_OPERATOR = ['+', '-', '*', '/'];

    let stack = [];
    for(let item of Object.values(p_rpn))
    {
		// an item is NOT an operator (it is a number, a function for example)
		if (BINARY_OPERATOR.indexOf(item) == -1)
		{
			stack.push(item);
		}
		else
		{
			// the item IS an operator
			let top = stack.pop();
			let top_under = stack.pop();

			let res = applyOpToArguments(item,top_under,top);
			stack.push(res);
		}
    }

    return stack[0];
}

///////////////////////////////////////////////////////////////////////////
//
// 
//
function markUnaryOperators()
{
	// stub!
}

///////////////////////////////////////////////////////////////////////////
//
// let tokens_arr = getTokens(p_input);
//
function checkInput(p_input) {

	let brackets_arr = p_input.match(/[()]/g);

	if (brackets_arr === null)
		return;

	let stack = [];

	for(let bracket of Object.values(brackets_arr))
	{
    	let isLeftBracket = bracket == '(';
		let isRightBracket = bracket == ')';
	
		if (isRightBracket)
    	{
			let top = undefined;
	
    		if (stack.length)
				top = stack[stack.length - 1];
	
			if (top === '(')
				stack.pop();
			else
    			stack.push(bracket)
		}
	
	if (isLeftBracket)
		stack.push(bracket);
	}

	if (stack.length > 0)
		throw Error("ExpressionError: Brackets must be paired");


	
}
///////////////////////////////////////////////////////////////////////////
//
// let tokens_arr = getTokens(p_input);
//
function getTokens(p_input) {
	let out_Tokens = [];

	let s = p_input;
	s = s.replace(/\s/g,'');

	// PCRE DO NOT WORK! :-(
	// let pre_tokens = s.match(/([^\d]*)(\d*[.]?\d*)/g);

	// ^^^
	// Array items with odd indexes are numbers
	// Array items with even indexes are brackets and operators
	// Amount of items is an ODD number

	let isFirstPreToken = true;
	// Let's use another approach!
	let pre_token_pairs = s.match(/\D*(\d*[.]?\d*)/g)
	for(let pair of Object.values(pre_token_pairs))
	{
		//let arr = pair.match(/(\D*)(\d+)/);
		let arr = pair.match(/(\D*)(\d*[.]?\d*)/);

		if (isFirstPreToken)
		{
			markUnaryOperators(arr,isFirstPreToken);
			isFirstPreToken = false;
		}

		let charsBeforeNumber = arr[1];
		let charsBeforeNumberArr = charsBeforeNumber.split('');

		let number = arr[2];

		// todo: refactor it! ;-)
		for(let char of Object.values(charsBeforeNumberArr))
		{
			out_Tokens.push(char);
		}
		//out_Tokens.push(charsBeforeNumberArr);

		// todo: refactor it either! ;-)
		if (number != '')
			out_Tokens.push(number);
	}

	return out_Tokens;

	//console.log(out_Tokens);
	//process.exit();
}

///////////////////////////////////////////////////////////////////////////
//
//
//
function convertToRPN(p_tokens_arr) {
/**
	# url: http://algolist.manual.ru/syntax/revpn.php
	# АЛГОРИТМ (БЕЗ УНАРНЫХ + И -)
=pod
<p>Во-втоpых,  получение обpатной польской записи из исходного
выpажения может осуществляться весьма пpосто на основе
пpостого алгоpитма, пpедложенного Дейкстpой. Для этого
вводится понятие стекового пpиоpитета опеpаций(табл. 1):</p>
<pre>        Таблица 1
|----------|-----------|
| Опеpация | Пpиоpитет |
|----------|-----------|
|    (     |     0     |
|    )     |     1     |
|   +|-    |     2     |
|   *|/    |     3     |
|   **     |     4     |
|----------|-----------|
</pre>                            
<p>   Пpосматpивается исходная стpока символов слева напpаво, 
опеpанды пеpеписываются в выходную стpоку,  а знаки опеpаций
заносятся в стек на основе следующих сообpажений:</p>

<p>  а) если стек пуст,  то опеpация из входной стpоки
     пеpеписывается в стек;</p>
<p>  б) опеpация выталкивает из стека все опеpации с большим
     или pавным пpиоpитетом в выходную стpоку;</p>
<IMPORTANT>
	 И САМА ОПЕРАЦИЯ ПОМЕЩАЕТСЯ В СТЕК!
	 (АВТОР ПРЯМО НЕ НАПИСАЛ ОБ ЭТОМ)
</IMPORTANT>
<p>  в) если очеpедной символ из исходной стpоки есть
     откpывающая скобка,  то он пpоталкивается в стек;</p>
<p>  г) закpывающая кpуглая скобка выталкивает все опеpации из
     стека до ближайшей откpывающей скобки,  сами скобки в
     выходную стpоку не пеpеписываются,  а уничтожают
     дpуг дpуга. </p>
<IMPORTANT>
	В КОНЦЕ РАБОТЫ ВСЕ ОПЕРАЦИИ, ЧТО ЕСТЬ В СТЕКЕ ВЫТАЛКИВАЮТСЯ
	В ВЫХОДНУЮ СТРОКУ!
</IMPORTANT>

=cut

**/
	let out_RPN = [];
	let PRIORITY = {
		'(' : 0,
		')' : 1,
		'+' : 2,
		'-' : 2,
		'*' : 3,
		'/' : 3
	};

	let operators_stack = [];

	for(let token of Object.values(p_tokens_arr))
	{
		let isLeftBracket = ( token == '(' );
		let isRightBracket = ( token == ')' );

		let isOperator = ( token.match(/[-+\*\/]/) !== null );

		//let c = console;
		//c.log(token);
		//c.log(isOperator);


		let isNumber = ( token.match(/\d/) !== null );

		let isStackEmpty = ( operators_stack.length == 0 );

		if (isNumber)
			out_RPN.push(token);

		if(isLeftBracket)
			operators_stack.push(token);

		if (isStackEmpty && isOperator)
			operators_stack.push(token);
		else if (isOperator)
		{
			if (PRIORITY[token] === undefined)
				throw Error("[ConvertToRPN] An uknown operator!");

			// Let's pop all the operators with >= priority
			while(operators_stack.length)
			{
				let top = operators_stack[operators_stack.length-1];

				if (PRIORITY[top] >= PRIORITY[token])
				{
					out_RPN.push(operators_stack.pop());
				}
				else
				{
					break;
				}
			}

			// Let's push an operator in the stack now.
			operators_stack.push(token);
		}
		else if(isRightBracket)
		{
			// Check the stack's size just in case ;-)
			while(operators_stack.length)
			{
				let top = operators_stack[operators_stack.length-1];
				if (top == '(')
				{
					// Let's remove the left bracket! :-)
					operators_stack.pop();
					break;
				}
				else
				{
					out_RPN.push(operators_stack.pop());
				}
			}
		}
	}

	// Let's empty the stack! :-)
	operators_stack.reverse();
	for(let op of Object.values(operators_stack))
		out_RPN.push(op);

	return out_RPN;
}



function expressionCalculator(p_expr) {
	checkInput(p_expr);
	return calcRPNExpression(convertToRPN(getTokens(p_expr)));
}


module.exports = {
    expressionCalculator,
    calcRPNExpression,
    getTokens,
    convertToRPN
}