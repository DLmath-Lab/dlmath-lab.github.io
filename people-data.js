/* =========================================================
   People 데이터 파일  (구성원 정보는 여기만 고치면 됩니다)
   ---------------------------------------------------------
   ※ 직접 고치는 것보다 admin.html 을 브라우저로 열어서
      편집하는 쪽이 훨씬 편하고 실수도 없습니다.

   [ 구조 ]
   PEOPLE_GROUPS = [ 그룹, 그룹, ... ]
   그룹  = { title: "그룹 이름", members: [ 사람, 사람, ... ] }
   사람  = { name, role, degree, current, email, interests, homepage }

   [ 사람 항목 설명 ]  ※ 비워두면("") 카드에 아예 표시되지 않습니다
   name      : 이름 (필수)
   role      : 이름 바로 아래 한 줄 (예: "Professor")
   degree    : DEGREE 항목  (예: "M.S. Alumni | 2025")
   current   : CURRENT 항목 (예: "Ph.D. student at Cornell University")
   email     : EMAIL 항목
   interests : RESEARCH INTERESTS 항목
   homepage  : HOMEPAGE 항목. 주소를 적으면 링크로 걸립니다.
               반드시 https:// 로 시작해야 합니다.

   카드에는 위 순서(role → degree → current → email → interests
   → homepage)대로 표시됩니다.
   ========================================================= */

const PEOPLE_GROUPS = [

    {
        title: "Professor",
        members: [
            {
                name: "Seungsang Oh",
                role: "Professor",
                degree: "",
                current: "",
                email: "seungsang@korea.ac.kr",
                interests: "Deep Learning, Topology, Knot Theory",
                homepage: ""
            }
        ]
    },

    {
        title: "Ph.D. Students",
        members: [
            {
                name: "Chanhyuk Choi",
                role: "",
                degree: "",
                current: "",
                email: "miraclecch@korea.ac.kr",
                interests: "Time Series Forecasting, Knot Theory",
                homepage: ""
            }
        ]
    },

    {
        title: "M.S. Students",
        members: [
            {
                name: "Sanghyeok Chung",
                role: "",
                degree: "",
                current: "",
                email: "cshzton@korea.ac.kr",
                interests: "Audio domain, Computer Vision, Reinforcement Learning",
                homepage: ""
            },
            {
                name: "Donggyu Lee",
                role: "",
                degree: "",
                current: "",
                email: "factorial6255@korea.ac.kr",
                interests: "Computer Vision",
                homepage: ""
            },
            {
                name: "Donggun Kim",
                role: "",
                degree: "",
                current: "",
                email: "dorage1105@korea.ac.kr",
                interests: "Topological Data Analysis, Computer Vision, Computational Topology, Topological Deep Learning",
                homepage: ""
            },
            {
                name: "Jeongbin You",
                role: "",
                degree: "",
                current: "",
                email: "dbwjdqls03@korea.ac.kr",
                interests: "3D Computer Vision, Large Language Model",
                homepage: ""
            },
            {
                name: "Younghyuk Kim",
                role: "",
                degree: "",
                current: "",
                email: "kimyh0721@korea.ac.kr",
                interests: "Reinforcement Learning",
                homepage: ""
            }
        ]
    },

    {
        title: "Interns / Undergraduates",
        members: [
            {
                name: "Seoyeon Park",
                role: "",
                degree: "",
                current: "",
                email: "parkseo08@sogang.ac.kr",
                interests: "Large Language Model",
                homepage: ""
            },
            {
                name: "Minjeong Lee",
                role: "",
                degree: "",
                current: "",
                email: "lmnjg03@korea.ac.kr",
                interests: "Reinforcement Learning, Computer Vision",
                homepage: ""
            },
            {
                name: "Seho Ahn",
                role: "",
                degree: "",
                current: "",
                email: "shahn21c@naver.com",
                interests: "Computer Vision, Time Series Forecasting",
                homepage: ""
            },
            {
                name: "Seungjoo Kim",
                role: "",
                degree: "",
                current: "",
                email: "ksj0117@korea.ac.kr",
                interests: "Deep Learning",
                homepage: ""
            },
            {
                name: "Minji Jeon",
                role: "",
                degree: "",
                current: "",
                email: "wjsalswl1525@korea.ac.kr",
                interests: "Large Language Model, Reinforcement Learning, Computer vision",
                homepage: ""
            },
            {
                name: "Hanseok Lim",
                role: "",
                degree: "",
                current: "",
                email: "rareuniv1@korea.ac.kr",
                interests: "Deep Learning, AI Security",
                homepage: ""
            }
        ]
    },

    {
        title: "Alumni",
        members: [
            {
                name: "Hyungkee Yoo",
                role: "",
                degree: "Ph.D. Alumni",
                current: "Professor, Department of Mathematics Education, Suncheon National University",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Hyoungjun Kim",
                role: "",
                degree: "Ph.D. Alumni",
                current: "Professor, Department of Mathematics Education, Kyungpook National University",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Sungjong No",
                role: "",
                degree: "Ph.D. Alumni",
                current: "Professor, Department of Mathematics, Kyonggi University",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Soobin Bae",
                role: "",
                degree: "M.S. Alumni | 2026",
                current: "PIXXGEN | Intern",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Seungeun Lee",
                role: "",
                degree: "M.S. Alumni | 2025",
                current: "Ph.D. student at New York University",
                email: "",
                interests: "",
                homepage: "https://duneag2.github.io"
            },
            {
                name: "Sangjun Lee",
                role: "",
                degree: "M.S. Alumni(MDS) | 2025",
                current: "BRIQUE",
                email: "",
                interests: "",
                homepage: "https://github.com/leesangjun1903"
            },
            {
                name: "Yoori Sin",
                role: "",
                degree: "M.S. Alumni(MDS) | 2025",
                current: "Ph.D. student at Yosei University",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Kihwan Lee",
                role: "",
                degree: "M.S. Alumni(MDS) | 2025",
                current: "DN Solutions",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Yunseong Cho",
                role: "",
                degree: "M.S. Alumni(MDS) | 2025",
                current: "PIXXGEN",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Suinne Clara Lee",
                role: "",
                degree: "M.S. Alumni(MDS) | 2025",
                current: "New England Conservatory, Boston, MA, USA",
                email: "",
                interests: "",
                homepage: "https://www.suinneclaralee.com"
            },
            {
                name: "Sunmook Choi",
                role: "",
                degree: "M.S. Alumni | 2024",
                current: "Ph.D. student at Cornell University",
                email: "",
                interests: "",
                homepage: "https://sunmookchoi.github.io"
            },
            {
                name: "Jisoo Song",
                role: "",
                degree: "M.S. Alumni | 2024",
                current: "Ph.D. student at Seoul National University(IPAI)",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Jungyoon Yang",
                role: "",
                degree: "M.S. Alumni | 2024",
                current: "",
                email: "",
                interests: "",
                homepage: ""
            },
            {
                name: "Jaehyo Lee",
                role: "",
                degree: "M.S. Alumni(MDS) | 2023",
                current: "",
                email: "",
                interests: "",
                homepage: ""
            }
        ]
    }

];
