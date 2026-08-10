/* =========================================================
   Publications 데이터 파일
   ---------------------------------------------------------
   ※ 직접 고치는 것보다 admin.html 편집기의 [Publications] 탭에서
      편집하는 쪽이 훨씬 편하고 실수도 없습니다.

   항목 하나 = { year, title, venue, color, bold, link }

   year  : 발표 연도 (숫자 네 자리). 이 값으로 연도별로 묶입니다.
   title : 논문 제목
   venue : 학술지 / 학회 이름과 권·호·쪽수
   color : 학술지 글자색. "" 로 두면 기본색(파랑)입니다.
           예) "#0a7a3d" 초록, "#c62828" 빨강
   bold  : true 로 두면 학술지 이름이 굵게 표시됩니다. (수상 논문 등)
   link  : 누르면 열리는 주소. 비워두면 제목으로 구글 학술검색을 엽니다.
   ========================================================= */

const PUBLICATIONS = [

    {
        year: "2025",
        title: "ResNet-BiGRU with Conditioned Query-Based Cross-Attention and Weighted Loss for Automated Chagas Disease Detection from 12-Lead ECG",
        venue: "Proc. CinC 2025",
        color: "#0a7a3d",
        bold: false,
        link: "https://scholar.google.com/scholar?q=ResNet-BiGRU+with+Conditioned+Query-Based+Cross-Attention+and+Weighted+Loss+for+Automated+Chagas+Disease+Detection+from+12-Lead+ECG"
    },

    {
        year: "2025",
        title: "Experimental Study: Enhancing Spoofing Detection with Fine-tuned Large Voice Models",
        venue: "Statistics",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Experimental+Study:+Enhancing+Spoofing+Detection+with+Fine-tuned+Large+Voice+Models"
    },

    {
        year: "2025",
        title: "iWAX: interpretable Wav2vec-AASIST-XGBoost framework for voice spoofing detection",
        venue: "Scientific Reports 15, 40491",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=iWAX:+interpretable+Wav2vec-AASIST-XGBoost+framework+for+voice+spoofing+detection"
    },

    {
        year: "2025",
        title: "Honeycomb-lattice monomer-dimer mixtures",
        venue: "Journal of Statistical Physics 192, 146",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Honeycomb-lattice+monomer-dimer+mixtures"
    },

    {
        year: "2025",
        title: "Enhancing voice spoofing detection in noisy environments using frequency feature masking augmentation",
        venue: "Engineering Science and Technology, an International Journal (ESTIJ) 63, 101972",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Enhancing+voice+spoofing+detection+in+noisy+environments+using+frequency+feature+masking+augmentation"
    },

    {
        year: "2024",
        title: "Lattice stick number 15 is unattainable for non-splittable links",
        venue: "Physica Scripta 99, 105250",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Lattice+stick+number+15+is+unattainable+for+non-splittable+links"
    },

    {
        year: "2024",
        title: "Efficiency of non-identical double helix patterns in minimizing ropelength of torus knot",
        venue: "Physica Scripta 99, 075240",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Efficiency+of+non-identical+double+helix+patterns+in+minimizing+ropelength+of+torus+knot"
    },

    {
        year: "2024",
        title: "Quantum knot mosaics and bounds of the growth constant",
        venue: "Reviews in Mathematical Physics, 2450025",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Quantum+knot+mosaics+and+bounds+of+the+growth+constant"
    },

    {
        year: "2024",
        title: "TB-ResNet: Bridging the gap from TDNN to ResNet in Automatic Speaker Verification with Temporal-bottleneck enhancement",
        venue: "Proc. ICASSP 2024, 10291-10295",
        color: "#0a7a3d",
        bold: false,
        link: "https://scholar.google.com/scholar?q=TB-ResNet:+Bridging+the+gap+from+TDNN+to+ResNet+in+Automatic+Speaker+Verification+with+Temporal-bottleneck+enhancement"
    },

    {
        year: "2024",
        title: "Topology-based optimization of handcuff graphs on 3D lattice",
        venue: "Physica Scripta 99, 015221",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Topology-based+optimization+of+handcuff+graphs+on+3D+lattice"
    },

    {
        year: "2024",
        title: "Augmented Aztec bipyramid and dicube tilings",
        venue: "Discrete Mathematics, 347, 113735 (Editors' Choice Award 2024)",
        color: "#c62828",
        bold: true,
        link: "https://scholar.google.com/scholar?q=Augmented+Aztec+bipyramid+and+dicube+tilings"
    },

    {
        year: "2023",
        title: "CAU KU deep fake detection system for ADD 2023 challenge",
        venue: "Proc. IJCAI 2023, 23-30",
        color: "#0a7a3d",
        bold: false,
        link: "https://scholar.google.com/scholar?q=CAU+KU+deep+fake+detection+system+for+ADD+2023+challenge"
    },

    {
        year: "2023",
        title: "Tetromino tilings on the Tetris board",
        venue: "Physica Scripta 98, 075228",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Tetromino+tilings+on+the+Tetris+board"
    },

    {
        year: "2023",
        title: "Domino tilings of Aztec octagons",
        venue: "Graphs and Combinatorics 39, 45",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Domino+tilings+of+Aztec+octagons"
    },

    {
        year: "2022",
        title: "Light-weight frequency information aware neural network architecture for voice spoofing detection",
        venue: "Proc. ICPR 2022, 477-483",
        color: "#0a7a3d",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Light-weight+frequency+information+aware+neural+network+architecture+for+voice+spoofing+detection"
    },

    {
        year: "2022",
        title: "Lattice conformation of theta-curves accompanied with Brunnian property",
        venue: "Journal of Physics A: Mathematical and Theoretical 55, 435207",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Lattice+conformation+of+theta-curves+accompanied+with+Brunnian+property"
    },

    {
        year: "2022",
        title: "Low-quality fake audio detection through frequency feature masking",
        venue: "Proc. DDAM 2022, 9-17",
        color: "#0a7a3d",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Low-quality+fake+audio+detection+through+frequency+feature+masking"
    },

    {
        year: "2022",
        title: "Overlapped frequency-distributed network: frequency-aware voice spoofing countermeasure",
        venue: "Proc. Interspeech 2022, 3558-3562",
        color: "#0a7a3d",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Overlapped+frequency-distributed+network:+frequency-aware+voice+spoofing+countermeasure"
    },

    {
        year: "2022",
        title: "Dimer coverings of 1-slab cubic lattices",
        venue: "Graphs and Combinatorics 38, 117",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Dimer+coverings+of+1-slab+cubic+lattices"
    },

    {
        year: "2022",
        title: "Bipartite intrinsically knotted graphs with 23 edges",
        venue: "Discrete Mathematics 345, 113022",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Bipartite+intrinsically+knotted+graphs+with+23+edges"
    },

    {
        year: "2022",
        title: "Counting dissections into integral squares",
        venue: "Discrete Mathematics 345, 112803",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Counting+dissections+into+integral+squares"
    },

    {
        year: "2021",
        title: "Tight conformation of 2-bridge knots using superhelices",
        venue: "Journal of Mathematical Physics 62, 113504",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Tight+conformation+of+2-bridge+knots+using+superhelices"
    },

    {
        year: "2021",
        title: "Topological aspects of theta-curves in cubic lattice",
        venue: "Journal of Physics A: Mathematical and Theoretical 54, 455204",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Topological+aspects+of+theta-curves+in+cubic+lattice"
    },

    {
        year: "2021",
        title: "Stick numbers of Montesinos knots and links",
        venue: "Journal of Knot Theory and Its Ramifications 30, 2150013",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Stick+numbers+of+Montesinos+knots+and+links"
    },

    {
        year: "2021",
        title: "Number of dominating sets in cylindric square grid graphs",
        venue: "Graphs and Combinatorics 37, 1357-1372",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Number+of+dominating+sets+in+cylindric+square+grid+graphs"
    },

    {
        year: "2019",
        title: "Enumeration of 1-slab lattice links",
        venue: "Topology and its Applications 264, 158-166",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Enumeration+of+1-slab+lattice+links"
    },

    {
        year: "2019",
        title: "Growth rate of quantum knot mosaics",
        venue: "Quantum Information Processing 18, 238",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Growth+rate+of+quantum+knot+mosaics"
    },

    {
        year: "2019",
        title: "Domino tilings for augmented Aztec rectangles and their chains",
        venue: "Electronic Journal of Combinatorics 26, #P3.2",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Domino+tilings+for+augmented+Aztec+rectangles+and+their+chains"
    },

    {
        year: "2019",
        title: "State matrix recursion method and monomer-dimer problem",
        venue: "Discrete Mathematics 342, 1434-1445",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=State+matrix+recursion+method+and+monomer-dimer+problem"
    },

    {
        year: "2019",
        title: "Arc index of spatial graphs",
        venue: "Journal of Graph Theory 90, 406-415",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Arc+index+of+spatial+graphs"
    },

    {
        year: "2018",
        title: "Ropelength of superhelices and (2, n)-torus knots",
        venue: "Journal of Physics A: Mathematical and Theoretical 51, 485203",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Ropelength+of+superhelices+and+(2,+n)-torus+knots"
    },

    {
        year: "2018",
        title: "More intrinsically knotted graphs with 22 edges and the restoring method",
        venue: "Journal of Knot Theory and Its Ramifications 27, 1850059",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=More+intrinsically+knotted+graphs+with+22+edges+and+the+restoring+method"
    },

    {
        year: "2018",
        title: "Lattice stick number of spatial graphs",
        venue: "Journal of Knot Theory and Its Ramifications 27, 1850048",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Lattice+stick+number+of+spatial+graphs"
    },

    {
        year: "2018",
        title: "Bisected vertex leveling of plane graphs: braid index, arc index and delta diagrams",
        venue: "Journal of Knot Theory and Its Ramifications 27, 1850044",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Bisected+vertex+leveling+of+plane+graphs:+braid+index,+arc+index+and+delta+diagrams"
    },

    {
        year: "2018",
        title: "Bounds on multiple self-avoiding polygons",
        venue: "Canadian Mathematical Bulletin 61, 518-530",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Bounds+on+multiple+self-avoiding+polygons"
    },

    {
        year: "2018",
        title: "Domino tilings of the expanded Aztec diamond",
        venue: "Discrete Mathematics 341, 1185-1191",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Domino+tilings+of+the+expanded+Aztec+diamond"
    },

    {
        year: "2017",
        title: "Stick number of spatial graphs",
        venue: "Journal of Knot Theory and Its Ramifications 26, 1750100",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Stick+number+of+spatial+graphs"
    },

    {
        year: "2017",
        title: "Maximal independent sets on a grid graph",
        venue: "Discrete Mathematics 340, 2762-2768",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Maximal+independent+sets+on+a+grid+graph"
    },

    {
        year: "2017",
        title: "A new intrinsically knotted graph with 22 edges",
        venue: "Topology and its Applications 228, 303-317",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=A+new+intrinsically+knotted+graph+with+22+edges"
    },

    {
        year: "2017",
        title: "Bipartite intrinsically knotted graphs with 22 edges",
        venue: "Journal of Graph Theory 85, 568-584",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Bipartite+intrinsically+knotted+graphs+with+22+edges"
    },

    {
        year: "2017",
        title: "Enumeration on graph mosaics",
        venue: "Journal of Knot Theory and Its Ramifications 26, 1750032",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Enumeration+on+graph+mosaics"
    },

    {
        year: "2017",
        title: "Period and toroidal knot mosaics",
        venue: "Journal of Knot Theory and Its Ramifications 26, 1750031",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Period+and+toroidal+knot+mosaics"
    },

    {
        year: "2016",
        title: "Enumerating independent vertex sets in grid graphs",
        venue: "Linear Algebra and Its Applications 510, 192-204",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Enumerating+independent+vertex+sets+in+grid+graphs"
    },

    {
        year: "2016",
        title: "Best packing of identical helices",
        venue: "Journal of Physics A: Mathematical and Theoretical 49, 415205",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Best+packing+of+identical+helices"
    },

    {
        year: "2016",
        title: "Quantum knot mosaics and the growth constant",
        venue: "Topology and its Applications 210, 311-316",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Quantum+knot+mosaics+and+the+growth+constant"
    },

    {
        year: "2016",
        title: "Exactly fourteen intrinsically knotted graphs have 21 edges",
        venue: "Algebraic and Geometric Topology 15, 3305-3322",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Exactly+fourteen+intrinsically+knotted+graphs+have+21+edges"
    },

    {
        year: "2015",
        title: "Quantum knots and the number of knot mosaics",
        venue: "Quantum Information Processing 14, 801-811",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Quantum+knots+and+the+number+of+knot+mosaics"
    },

    {
        year: "2015",
        title: "Link lengths and their growth powers",
        venue: "Journal of Physics A: Mathematical and Theoretical 48, 035202",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Link+lengths+and+their+growth+powers"
    },

    {
        year: "2014",
        title: "Mosaic number of knots",
        venue: "Journal of Knot Theory and Its Ramifications 23, 1450069",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Mosaic+number+of+knots"
    },

    {
        year: "2014",
        title: "Upper bound on the total number of knot n-mosaics",
        venue: "Journal of Knot Theory and Its Ramifications 23, 1450065",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Upper+bound+on+the+total+number+of+knot+n-mosaics"
    },

    {
        year: "2014",
        title: "Minimum lattice length and ropelength of 2-bridge knots and links",
        venue: "Journal of Mathematical Physics 55, 113503",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Minimum+lattice+length+and+ropelength+of+2-bridge+knots+and+links"
    },

    {
        year: "2014",
        title: "Small knot mosaics and partition matrices",
        venue: "Journal of Physics A: Mathematical and Theoretical 47, 435201",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Small+knot+mosaics+and+partition+matrices"
    },

    {
        year: "2014",
        title: "Minimum lattice length and ropelength of knots",
        venue: "Journal of Knot Theory and Its Ramifications 23, 1460009",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Minimum+lattice+length+and+ropelength+of+knots"
    },

    {
        year: "2014",
        title: "Equilateral stick number of knots",
        venue: "Journal of Knot Theory and Its Ramifications 23, 1460008",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Equilateral+stick+number+of+knots"
    },

    {
        year: "2014",
        title: "Links with small lattice stick numbers",
        venue: "Journal of Physics A: Mathematical and Theoretical 47, 155202",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Links+with+small+lattice+stick+numbers"
    },

    {
        year: "2013",
        title: "Upper bound on lattice stick number of knots",
        venue: "Mathematical Proceedings of the Cambridge Philosophical Society 155, 173-179",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Upper+bound+on+lattice+stick+number+of+knots"
    },

    {
        year: "2013",
        title: "Upper bounds on the minimum length of cubic lattice knots",
        venue: "Journal of Physics A: Mathematical and Theoretical 46, 125001",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Upper+bounds+on+the+minimum+length+of+cubic+lattice+knots"
    },

    {
        year: "2011",
        title: "Stick numbers of 2-bridge knots and links",
        venue: "Proceedings of the American Mathematical Society 139, 4143-4152",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Stick+numbers+of+2-bridge+knots+and+links"
    },

    {
        year: "2011",
        title: "An upper bound on stick number of knots",
        venue: "Journal of Knot Theory and Its Ramifications 20, 741-747",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=An+upper+bound+on+stick+number+of+knots"
    },

    {
        year: "2010",
        title: "Knots with small lattice stick numbers",
        venue: "Journal of Physics A: Mathematical and Theoretical 43, 265002",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Knots+with+small+lattice+stick+numbers"
    },

    {
        year: "2006",
        title: "Reducing Dehn fillings and small surfaces",
        venue: "Proceedings of London Mathematical Society 92, 203-223",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Reducing+Dehn+fillings+and+small+surfaces"
    },

    {
        year: "2005",
        title: "Lattice stick numbers of small knots",
        venue: "Journal of Knot Theory and Its Ramifications 14, 859-867",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Lattice+stick+numbers+of+small+knots"
    },

    {
        year: "2003",
        title: "Planar graphs producing no strongly almost trivial embedding",
        venue: "Journal of Graph Theory 43, 319-326",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Planar+graphs+producing+no+strongly+almost+trivial+embedding"
    },

    {
        year: "2003",
        title: "Reducing spheres and Klein bottles after Dehn fillings",
        venue: "Canadian Mathematical Bulletin 46, 265-267",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Reducing+spheres+and+Klein+bottles+after+Dehn+fillings"
    },

    {
        year: "2003",
        title: "P2 reducing and toroidal Dehn fillings",
        venue: "Mathematical Proceedings of the Cambridge Philosophical Society 134, 271-288",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=P2+reducing+and+toroidal+Dehn+fillings"
    },

    {
        year: "2002",
        title: "An elementary set for theta-n-curve projections",
        venue: "Journal of Knot Theory and Its Ramifications 11, 1243-1250",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=An+elementary+set+for+theta-n-curve+projections"
    },

    {
        year: "2002",
        title: "Constructing persistently laminar knots",
        venue: "Topology and its Applications 124, 139-143",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Constructing+persistently+laminar+knots"
    },

    {
        year: "2002",
        title: "Dehn fillings creating essential spheres and tori",
        venue: "Journal of Knot Theory and Its Ramifications 11, 887-890",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Dehn+fillings+creating+essential+spheres+and+tori"
    },

    {
        year: "2002",
        title: "Strongly almost trivial theta-curves",
        venue: "Journal of Knot Theory and Its Ramifications 11, 153-164",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Strongly+almost+trivial+theta-curves"
    },

    {
        year: "1998",
        title: "Dehn filling, reducible 3-manifolds, and Klein bottles",
        venue: "Proceedings of the American Mathematical Society 126, 289-296",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Dehn+filling,+reducible+3-manifolds,+and+Klein+bottles"
    },

    {
        year: "1997",
        title: "Reducible and toroidal 3-manifolds obtained by Dehn fillings",
        venue: "Topology and its Applications 75, 93-104",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Reducible+and+toroidal+3-manifolds+obtained+by+Dehn+fillings"
    },

    {
        year: "1996",
        title: "Knotted solid tori decompositions of B^3 and S^3",
        venue: "Journal of Knot Theory and Its Ramifications 5, 405-416",
        color: "",
        bold: false,
        link: "https://scholar.google.com/scholar?q=Knotted+solid+tori+decompositions+of+B%5E3+and+S%5E3"
    }

];
