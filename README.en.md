<div align="center">
  <h1 align="center">The Elements of Computing Systems - Building a Modern Computer (nand2tetris)</h1>
  <p align="center"><a href="./README.md">简体中文</a> / English</p>
  <p align="center">Build a complete computer system from first principles through 12 chapters and projects.</p>
</div>

---

This book covers computer architecture (Chapters 1-5), compiler design (Chapters 6-11), and operating systems (Chapter 12). Despite the breadth of content, the book is remarkably accessible, with an excellent translation. Every chapter includes hands-on exercises that require you to write code — a classic blend of theory and practice.

Here is a quote from the book's introduction to give you a sense of what to expect:

> This book presents a complete and rigorous picture of computer science by guiding readers through the construction of a simple yet powerful computer system. The authors believe that the best way to understand how computers work is to build one from scratch.
>
> Through 12 chapters and projects, the book leads readers step-by-step in building a basic hardware platform and a modern software hierarchy. Along the way, readers gain solid knowledge of hardware architecture, operating systems, programming languages, compilers, data structures, algorithms, and software engineering. By taking this incremental approach, the book reveals the essential components of computer science and shows how the theories and techniques introduced in other courses fit into the big picture.
>
> The book follows a "first abstract, then implement" model: each chapter introduces a key hardware or software abstraction, an implementation approach, and a hands-on project. All the computer science knowledge needed to complete these projects is covered in the book — only prior programming experience is required. The companion website provides the necessary tools and materials for building all the hardware and software systems, along with 200 test programs for the 12 projects.
>
> The book covers a broad range of topics and is suitable for both undergraduate and graduate students, developers, teachers, and technology enthusiasts.

The barrier to entry is very low — as long as you are comfortable with one programming language, you are ready to go.

The book starts from NAND gates and teaches you to build a complete computer step by step (Chapters 1-5). From Chapter 6 through Chapter 11, you will implement three compilers (an assembler, a VM translator, and a Jack language compiler). The final chapter covers parts of an operating system.

If you complete all the projects in this book, you will have achieved:
* Built a computer (running on a simulator)
* Implemented a programming language and its standard library
* Implemented a simple compiler

With most other compiler textbooks, you might finish them and still have no idea where to start building a real compiler. This book is different — **it walks you through implementing a compiler step by step**.

## Solutions in Other Languages
The labs in Chapters 6-11 require a high-level language. This repository uses JavaScript. However, many developers prefer other languages, so I have included links to implementations in other languages for reference:
* [Java](https://github.com/AllenWrong/nand2tetris)
* [C++](https://github.com/FusionBolt/The-Elements-of-Computer-Systems-Project)
* [Python](https://github.com/xrahoo/nand2tetris-python)

## Resources
* [Full tool suite download](https://github.com/woai3c/teocs-exercises/blob/master/nand2tetris.zip)
* [Video course by the authors](https://www.coursera.org/learn/build-a-computer/home/welcome)
* [Official website](https://www.nand2tetris.org/)

For the book PDF, join the QQ group **39014053** and download it from the group files.

### Note
This repository contains only the solutions. Test cases and tools are included in the repository as **nand2tetris.zip** — unzip it after cloning.

If you have questions, feel free to open an [issue](https://github.com/woai3c/nand2tetris/issues) or join the QQ discussion group **39014053**.

## Known Issues
* [Unable to open `.bat` files on Windows](https://github.com/woai3c/nand2tetris/tree/master/09)

## Contents Overview
After completing all the projects, you can run the provided test suites to experience the magic of computing:

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d040649df3bb4cd28b7b90a9f857fe4e~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5820185fae84ac389f457d5df08f2c8~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae42f59db6714190a9a2b8c13741d0c2~tplv-k3u1fbpfcp-zoom-1.image)

## Hardware Platform

### 1. Boolean Logic
Introduces basic logic gates, all built on top of NAND gates:
* and  and16
* dmux  dmux4way  dmux8way
* mux  mux16  mux4way16  mux8way16
* not  not16
* or  or16  or8way
* xor

### 2. Boolean Arithmetic
* Binary numbers
* Binary addition
* Half adder
* Full adder
* Adder
* Incrementer
* ALU

### 3. Sequential Logic
#### Combinational Chips
* Boolean chips
* Arithmetic chips

#### Sequential Chips
Sequential chips are built on large numbers of DFF gates:
* Clock
* Flip-flop
* Register
* Memory
* Counter

### 4. Machine Language
* A-instruction
* C-instruction
* Addressing modes: direct, immediate, indirect

### 5. Computer Architecture
* Memory
* CPU
* Registers
* I/O

## Software Hierarchy
6. Assembler
7. Virtual Machine I: Stack Arithmetic
8. Virtual Machine II: Program Control
9. High-Level Language
10. Compiler I: Syntax Analysis
11. Compiler II: Code Generation
12. Operating System

## License
MIT
