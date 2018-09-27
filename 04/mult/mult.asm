// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// 3*2 换算成 2个3相加
    // 初始化
    @2
    M = 0

    // 判断是否小于0
    @0
    D = M
    @END
    D;JLT
(LOOP)
    @1
    M = M - 1
    D = M
    @END
    D;JLT

    @0
    D = M
    @2
    M = M + D

    @LOOP
    0;JMP
(END)
    @END
    0;JMP