#8086 Simulator
A web based graphical user interface which simulates 8088 microprocessors working.

##MODEL DESIGN DETAILS
We have designed an 8086 micro-processor model using JavaScript to code the whole model. To create the front-end and visuals of our design, HTML and CSS are used.  A text editor API is used through which users will enter their instructions and the instructions are compiled and run line-by-line through the buttons provided. Furthermore, for simplicity, only 8 registers and 16 memory locations have been added that are shown on the front-end to the user. The front-end also displays the machine code, current instruction running, and block diagram of the instruction cycles the instruction is passing through. Five instruction cycles have been added that include, BIU, Decode, ALU, Memory and Control Unit.  To help the users better understand which instruction cycles are used in each instruction, we have added animations to the block diagram. Whenever an instruction passes through one of the five cycles, the block of the particular cycle is highlighted by color and the instruction is also displayed within that block with a certain delay between each cycle. This wraps up the design features of the front-end that we designed to showcase our model of 8086. Moreover, we have added the feature to only allow 8-bit value in an 8-bit register and 16-bit value in 16-bit register i.e. bit compatibility feature.

##MODEL DESIGN TECHNICALITIES
Moving on from the details of our model and onto the technicalities. Our design includes a very strict syntax as we didn’t include many error checks in the syntax. Therefore, the user has to follow certain rules when giving instructions in the text box that appears on the web page. Some of the rules are given below:
•	After typing a comma “,” the user has to give a space before writing anything else.
•	Double spaces are not allowed.
•	Only single line comments can be written using ‘’;’’.
•	Memory address should be in decimal.
•	When introducing a label, the label takes up the whole line. No other instructions can be written in-front of it.

##INSTRUCTIONS INCLUDED IN THE MODEL
Our 8086 model includes 15 instructions that the user can provide and get an accurate output. The instruction include:
1.	MOV: 
Our mov instructions takes all possible cases into consideration and allows the user to perform the instruction on any of the following cases:
•	REG --> REG
•	IMMEDIETE --> REG
•	IMMEDIETE --> MEM (direct)
•	IMMEDIETE --> MEM (register indirect)
•	REG --> MEM (direct)
•	REG --> MEM (Register indirect)
•	MEM (direct) --> REG
•	MEM (register) --> REG

2.	INC:
Inc instruction allows a value to be incremented.
3.	DEC:
Dec instruction allows a value to be decremented.
4.	NEG:
Neg instruction allows the user to get 1’s compliment of a number.
5.	NOT:
Not instruction allows the user to get 2’s compliment of a number.

6.	AND:
And instruction allows the user to take AND of two values and store the result in the first operand. The following cases have been included in the instruction:
•	REG --> REG
•	IMMEDIETE --> REG
•	IMMEDIETE --> MEM (direct)
•	IMMEDIETE --> MEM (register indirect)
•	REG --> MEM (direct)
•	REG --> MEM (Register indirect)
•	MEM (direct) --> REG
•	MEM (register) --> REG

7.	OR:
Or instruction allows the user to take OR of two values and store the result in the first operand. The following cases have been included in the instruction:
•	REG --> REG
•	IMMEDIETE --> REG
•	IMMEDIETE --> MEM (direct)
•	IMMEDIETE --> MEM (register indirect)
•	REG --> MEM (direct)
•	REG --> MEM (Register indirect)
•	MEM (direct) --> REG
•	MEM (register) --> REG

8.	XOR:
Xor instruction allows the user to take XOR of two values and store the result in the first operand. The following cases have been included in the instruction:
•	REG --> REG
•	IMMEDIETE --> REG
•	IMMEDIETE --> MEM (direct)
•	IMMEDIETE --> MEM (register indirect)
•	REG --> MEM (direct)
•	REG --> MEM (Register indirect)
•	MEM (direct) --> REG
•	MEM (register) --> REG

9.	ADD:
Add instruction allows the user to ADD two values and store the result in the first operand. The following cases have been included in the instruction:
•	REG --> REG
•	IMMEDIETE --> REG
•	IMMEDIETE --> MEM (direct)
•	IMMEDIETE --> MEM (register indirect)
•	REG --> MEM (direct)
•	REG --> MEM (Register indirect)
•	MEM (direct) --> REG
•	MEM (register) --> REG

10.	SUB:
Sub instruction allows the user to SUBTRACT two values and store the result in the first operand. The following cases have been included in the instruction:
•	REG --> REG
•	IMMEDIETE --> REG
•	IMMEDIETE --> MEM (direct)
•	IMMEDIETE --> MEM (register indirect)
•	REG --> MEM (direct)
•	REG --> MEM (Register indirect)
•	MEM (direct) --> REG
•	MEM (register) --> REG

11.	JMP:
Jmp instruction allows the user to JUMP to a label.
12.	JE:
JE instruction allows a user to JUMP to a label when zero flag is 1, which means that the two values are equal.
13.	JZ:
JE instruction allows a user to JUMP to a label when zero flag is 1.
14.	JNE:
JE instruction allows a user to JUMP to a label when zero flag is 0, which means that the two values are not equal.
15.	CMP:
Cmp instruction allows the user to COMPARE two values.
16.	XCHG:
Xchg instruction allows the user to EXCHANGE values between two operands.
17.	NOP:
Nop instruction basically means no operation is being done.

