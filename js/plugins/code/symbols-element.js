import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class SymbolsElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            user-select: none;
        }
        :host {
            display: block;
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        .container {
            position: relative;
            height: 100%;
            width: 100%;
        }
        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }
        @media (max-width: 900px) {
            .header {
                min-height: 30px;
            }
        }
        .header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
        }
        .header-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-title {
            font-size: 30px;
            font-weight: 500;
        }
        @media (max-width: 900px) {
            .header-title {
                width: 100%;
                text-align: center;
                margin-top: 20px;
                font-size: 20px;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
        }
        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 22px;
        }
        .search-input {
            width: 100%;
            max-width: 400px;
            padding: var(--padding-w2);
            border: 2px solid transparent;
            border-radius: var(--radius);
            outline: none;
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
        .search-input:focus {
            border: 2px solid var(--fg-1);
            background-color: var(--bg-1);
        }
        .symbols-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
            gap: 1rem;
            overflow-y: auto;
            flex: 1;
            align-items: start;
        }
        .symbol-item {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-3);
            text-align: center;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .symbol-item:hover {
            background-color: var(--bg-2);
        }
        .symbol {
            font-size: 24px;
        }
        .content-area {
            padding: var(--padding-4);
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            overflow: hidden;
        }

        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 15px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 4px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }
        ::placeholder {
            color: var(--fg-2);
        }
        img[src*='/a7/forget/dialog-x.svg'] {
            filter: var(--themed-svg);
        }
        @media (max-width: 900px) {
            img[src*='/a7/forget/dialog-x.svg'] {
                display: none;
            }
        }
    `;

    static properties = {
        searchTerm: { type: String },
        filteredSymbols: { type: Array },
    };

    constructor() {
        super();
        this.searchTerm = '';
        ((this.symbols = {
            doubleQuote: '"',
            ampersand: '&',
            singleQuote: "'",
            lessThan: '<',
            greaterThan: '>',
            invertedExclamation: '¡',
            centSign: '¢',
            poundSign: '£',
            currencySign: '¤',
            yenSign: '¥',
            euroSign: '€',
            dollarSign: '$',
            rupeeSign: '₹',
            rubleSign: '₽',
            bitcoinSign: '₿',
            wonSign: '₩',
            shekelSign: '₪',
            pesoSign: '₱',
            bahtSign: '฿',
            colonSign: '₡',
            cruzeirSign: '₢',
            franceSign: '₣',
            liraSign: '₤',
            millSign: '₥',
            nairaSign: '₦',
            peseteSign: '₧',
            pfennigSign: '₰',
            cedisSign: '₵',
            cediSign: '¢',
            dongsSign: '₫',
            drachmaSign: '₯',
            guaraniSign: '₲',
            tugrikSign: '₮',
            hryvniaSign: '₴',
            austrelSign: '₳',
            kipsSign: '₭',
            brokenVerticalBar: '¦',
            sectionSign: '§',
            diaeresis: '¨',
            copyrightSign: '©',
            feminineOrdinal: 'ª',
            leftDoubleAngleQuote: '«',
            negationSign: '¬',
            registeredSign: '®',
            macron: '¯',
            degreeSign: '°',
            plusMinusSign: '±',
            superscriptTwo: '²',
            superscriptThree: '³',
            acuteAccent: '´',
            microSign: 'µ',
            paragraphSign: '¶',
            middleDot: '·',
            cedilla: '¸',
            superscriptOne: '¹',
            masculineOrdinal: 'º',
            rightDoubleAngleQuote: '»',
            oneQuarter: '¼',
            oneHalf: '½',
            threeQuarters: '¾',
            invertedQuestionMark: '¿',
            uppercaseAGrave: 'À',
            uppercaseAAcute: 'Á',
            uppercaseACircumflex: 'Â',
            uppercaseATilde: 'Ã',
            uppercaseADiaeresis: 'Ä',
            uppercaseARing: 'Å',
            uppercaseAE: 'Æ',
            uppercaseCCedilla: 'Ç',
            uppercaseEGrave: 'È',
            uppercaseEAcute: 'É',
            uppercaseECircumflex: 'Ê',
            uppercaseEDiaeresis: 'Ë',
            uppercaseIGrave: 'Ì',
            uppercaseIAcute: 'Í',
            uppercaseICircumflex: 'Î',
            uppercaseIDiaeresis: 'Ï',
            uppercaseEth: 'Ð',
            uppercaseNTilde: 'Ñ',
            uppercaseOGrave: 'Ò',
            uppercaseOAcute: 'Ó',
            uppercaseOCircumflex: 'Ô',
            uppercaseOTilde: 'Õ',
            uppercaseODiaeresis: 'Ö',
            multiplicationSign: '×',
            uppercaseOSlash: 'Ø',
            uppercaseUGrave: 'Ù',
            uppercaseUAcute: 'Ú',
            uppercaseUCircumflex: 'Û',
            uppercaseUDiaeresis: 'Ü',
            uppercaseYAcute: 'Ý',
            uppercaseThorn: 'Þ',
            sharpS: 'ß',
            lowercaseAGrave: 'à',
            lowercaseAAcute: 'á',
            lowercaseACircumflex: 'â',
            lowercaseATilde: 'ã',
            lowercaseADiaeresis: 'ä',
            lowercaseARing: 'å',
            lowercaseAE: 'æ',
            lowercaseCCedilla: 'ç',
            lowercaseEGrave: 'è',
            lowercaseEAcute: 'é',
            lowercaseECircumflex: 'ê',
            lowercaseEDiaeresis: 'ë',
            lowercaseIGrave: 'ì',
            lowercaseIAcute: 'í',
            lowercaseICircumflex: 'î',
            lowercaseIDiaeresis: 'ï',
            lowercaseEth: 'ð',
            lowercaseNTilde: 'ñ',
            lowercaseOGrave: 'ò',
            lowercaseOAcute: 'ó',
            lowercaseOCircumflex: 'ô',
            lowercaseOTilde: 'õ',
            lowercaseODiaeresis: 'ö',
            divisionSign: '÷',
            lowercaseOSlash: 'ø',
            lowercaseUGrave: 'ù',
            lowercaseUAcute: 'ú',
            lowercaseUCircumflex: 'û',
            lowercaseUDiaeresis: 'ü',
            lowercaseYAcute: 'ý',
            lowercaseThorn: 'þ',
            lowercaseYDiaeresis: 'ÿ',
            uppercaseOE: 'Œ',
            lowercaseOE: 'œ',
            uppercaseScaron: 'Š',
            lowercaseScaron: 'š',
            uppercaseYDiaeresis: 'Ÿ',
            florin: 'ƒ',
            circumflexAccent: 'ˆ',
            tildeAccent: '˜',
            greekAlpha: 'Α',
            greekBeta: 'Β',
            greekGamma: 'Γ',
            greekDelta: 'Δ',
            greekEpsilon: 'Ε',
            greekZeta: 'Ζ',
            greekEta: 'Η',
            greekTheta: 'Θ',
            greekIota: 'Ι',
            greekKappa: 'Κ',
            greekLambda: 'Λ',
            greekMu: 'Μ',
            greekNu: 'Ν',
            greekXi: 'Ξ',
            greekOmicron: 'Ο',
            greekPi: 'Π',
            greekRho: 'Ρ',
            greekSigma: 'Σ',
            greekTau: 'Τ',
            greekUpsilon: 'Υ',
            greekPhi: 'Φ',
            greekChi: 'Χ',
            greekPsi: 'Ψ',
            greekOmega: 'Ω',
            greekAlphaLower: 'α',
            greekBetaLower: 'β',
            greekGammaLower: 'γ',
            greekDeltaLower: 'δ',
            greekEpsilonLower: 'ε',
            greekZetaLower: 'ζ',
            greekEtaLower: 'η',
            greekThetaLower: 'θ',
            greekIotaLower: 'ι',
            greekKappaLower: 'κ',
            greekLambdaLower: 'λ',
            greekMuLower: 'μ',
            greekNuLower: 'ν',
            greekXiLower: 'ξ',
            greekOmicronLower: 'ο',
            greekPiLower: 'π',
            greekRhoLower: 'ρ',
            greekSigmaFinal: 'ς',
            greekSigmaLower: 'σ',
            greekTauLower: 'τ',
            greekUpsilonLower: 'υ',
            greekPhiLower: 'φ',
            greekChiLower: 'χ',
            greekPsiLower: 'ψ',
            greekOmegaLower: 'ω',
            greekThetaSymbol: 'ϑ',
            greekUpsilonHook: 'ϒ',
            greekPiSymbol: 'ϖ',
            enSpace: ' ',
            enDash: '–',
            emDash: '—',
            leftSingleQuote: "'",
            rightSingleQuote: "'",
            singleLowQuote: '‚',
            doubleLowQuote: '„',
            singleDagger: '†',
            doubleDagger: '‡',
            bullet: '•',
            horizontalEllipsis: '…',
            perMille: '‰',
            singlePrime: '′',
            doublePrime: '″',
            singleLeftAngleQuote: '‹',
            singleRightAngleQuote: '›',
            overline: '‾',
            fractionSlash: '⁄',
            euroSign: '€',
            imaginaryI: 'ℑ',
            scriptP: '℘',
            realNumberR: 'ℜ',
            trademark: '™',
            alef: 'ℵ',
            leftArrow: '←',
            upArrow: '↑',
            rightArrow: '→',
            downArrow: '↓',
            leftRightArrow: '↔',
            returnArrow: '↵',
            leftDoubleArrow: '⇐',
            upDoubleArrow: '⇑',
            rightDoubleArrow: '⇒',
            downDoubleArrow: '⇓',
            leftRightDoubleArrow: '⇔',
            forAll: '∀',
            partialDifferential: '∂',
            thereExists: '∃',
            emptySet: '∅',
            nabla: '∇',
            elementOf: '∈',
            notElementOf: '∉',
            contains: '∋',
            nAryProduct: '∏',
            nArySum: '∑',
            minusSign: '−',
            asteriskOperator: '∗',
            squareRoot: '√',
            proportionalTo: '∝',
            infinity: '∞',
            angle: '∠',
            logicalAnd: '∧',
            logicalOr: '∨',
            intersection: '∩',
            union: '∪',
            integral: '∫',
            therefore: '∴',
            similarTo: '∼',
            congruentTo: '≅',
            approximatelyEqual: '≈',
            notEqual: '≠',
            identicalTo: '≡',
            lessThanOrEqual: '≤',
            greaterThanOrEqual: '≥',
            subset: '⊂',
            superset: '⊃',
            notSubset: '⊄',
            subsetOrEqual: '⊆',
            supersetOrEqual: '⊇',
            circledPlus: '⊕',
            circledTimes: '⊗',
            perpendicular: '⊥',
            dotOperator: '⋅',
            leftCeiling: '⌈',
            rightCeiling: '⌉',
            leftFloor: '⌊',
            rightFloor: '⌋',
            leftAngleBracket: '〈',
            rightAngleBracket: '〉',
            lozenge: '◊',
            spadeSuit: '♠',
            clubSuit: '♣',
            heartSuit: '♥',
            diamondSuit: '♦',

            // Mathematical Operators
            squaredOperator: '²',
            cubedOperator: '³',
            fourthPower: '⁴',
            fifthPower: '⁵',
            nthPower: 'ⁿ',
            squareRoot: '√',
            cubeRoot: '∛',
            fourthRoot: '∜',
            infinitySymbol: '∞',
            approximately: '≈',
            notEqual: '≠',
            lessOrEqual: '≤',
            greaterOrEqual: '≥',
            muchLessThan: '≪',
            muchGreaterThan: '≫',
            plusMinus: '±',
            minusPlus: '∓',
            multiplication: '×',
            division: '÷',
            bulletOperator: '⋅',
            proportional: '∝',

            // Set Theory
            emptySet: '∅',
            elementOf: '∈',
            notElementOf: '∉',
            containsAsMember: '∋',
            union: '∪',
            intersection: '∩',
            subset: '⊂',
            superset: '⊃',
            subsetEqual: '⊆',
            supersetEqual: '⊇',
            notSubsetOrEqual: '⊈',
            notSupersetOrEqual: '⊉',
            notMuchLessThan: '≮',
            notMuchGreaterThan: '≯',

            // More Math Symbols
            partialDifferential: '∂',
            increment: '∆',
            gradient: '∇',
            elementOf: '∈',
            notElementOf: '∉',
            containsAsMember: '∋',
            proportionalTo: '∝',
            infinity: '∞',
            angle: '∠',
            therefore: '∴',
            because: '∵',
            approximatelyEqual: '≈',
            notEqual: '≠',
            lessThanOrEqual: '≤',
            greaterThanOrEqual: '≥',
            identicalTo: '≡',
            summation: '∑',
            product: '∏',
            integral: '∫',
            doubleIntegral: '∬',
            tripleIntegral: '∭',
            contourIntegral: '∮',
            closedSurfaceIntegral: '∯',
            closedVolumeIntegral: '∰',

            // More Arrows
            upwardsArrow: '↑',
            downwardsArrow: '↓',
            leftwardsArrow: '←',
            rightwardsArrow: '→',
            northEastArrow: '↗',
            southEastArrow: '↘',
            southWestArrow: '↙',
            northWestArrow: '↖',
            leftRightArrow: '↔',
            upDownArrow: '↕',
            longRightwardsArrow: '⟶',
            longLeftwardsArrow: '⟵',
            upwardsDoubleArrow: '⇑',
            downwardsDoubleArrow: '⇓',
            leftwardsDoubleArrow: '⇐',
            rightwardsDoubleArrow: '⇒',
            leftRightDoubleArrow: '⇔',

            // Technical Symbols
            telephoneSymbol: '℡',
            gearSymbol: '⚙',
            hammerAndPick: '⚒',
            anchorSymbol: '⚓',
            warningSign: '⚠',
            biohazardSymbol: '☣',
            radioactiveSymbol: '☢',
            recycleSymbol: '♻',
            upwardsPointingIndex: '☝',

            // More Geometric Shapes
            blackDiamondSuit: '♦',
            blackHeartSuit: '♥',
            blackSpadeSuit: '♠',
            blackClubSuit: '♣',
            whiteDiamondSuit: '◇',
            whiteHeartSuit: '♡',
            whiteSpadeSuit: '♤',
            whiteClubSuit: '♧',
            blackCircle: '●',
            whiteCircle: '○',
            blackSquare: '■',
            whiteSquare: '□',
            blackTriangle: '▲',
            whiteTriangle: '△',
            blackDownPointingTriangle: '▼',
            whiteDownPointingTriangle: '▽',
            blackLeftPointingTriangle: '◄',
            whiteLeftPointingTriangle: '◅',
            blackRightPointingTriangle: '►',
            whiteRightPointingTriangle: '▻',

            // More Punctuation
            emQuad: ' ',
            enQuad: ' ',
            figureSpace: ' ',
            punctuationSpace: ' ',
            thinSpace: ' ',
            hairSpace: ' ',
            lineSeparator: '\u2028',
            paragraphSeparator: '\u2029',
            narrowNoBreakSpace: '\u202F',
            mediumMathematicalSpace: '\u205F',
            ideographicSpace: '　',

            // Braille Patterns
            braillePatternBlank: '⠀',
            braillePatternDots1: '⠁',
            braillePatternDots2: '⠂',
            braillePatternDots12: '⠃',
            braillePatternDots3: '⠄',
            braillePatternDots13: '⠅',
            braillePatternDots23: '⠆',
            braillePatternDots123: '⠇',
            braillePatternDots4: '⠐',
            braillePatternDots14: '⠑',
            braillePatternDots24: '⠒',
            braillePatternDots124: '⠓',
            braillePatternDots34: '⠔',
            braillePatternDots134: '⠕',
            braillePatternDots234: '⠖',
            braillePatternDots1234: '⠗',
            braillePatternDots5: '⠠',
            braillePatternDots15: '⠡',
            braillePatternDots25: '⠢',
            braillePatternDots125: '⠣',
            braillePatternDots35: '⠤',
            braillePatternDots135: '⠥',
            braillePatternDots235: '⠦',
            braillePatternDots1235: '⠧',
            braillePatternDots45: '⠨',
            braillePatternDots145: '⠩',
            braillePatternDots245: '⠪',
            braillePatternDots1245: '⠫',
            braillePatternDots345: '⠬',
            braillePatternDots1345: '⠭',
            braillePatternDots2345: '⠮',
            braillePatternDots12345: '⠯',
            braillePatternDots6: '⠰',
            braillePatternDots16: '⠱',
            braillePatternDots26: '⠲',
            braillePatternDots126: '⠳',
            braillePatternDots36: '⠴',
            braillePatternDots136: '⠵',
            braillePatternDots236: '⠶',
            braillePatternDots1236: '⠷',
            braillePatternDots46: '⠸',
            braillePatternDots146: '⠹',
            braillePatternDots246: '⠺',
            braillePatternDots1246: '⠻',
            braillePatternDots346: '⠼',
            braillePatternDots1346: '⠽',
            braillePatternDots2346: '⠾',
            braillePatternDots12346: '⠿',
            braillePatternDots56: '⡀',
            braillePatternDots156: '⡁',
            braillePatternDots256: '⡂',
            braillePatternDots1256: '⡃',
            braillePatternDots356: '⡄',
            braillePatternDots1356: '⡅',
            braillePatternDots2356: '⡆',
            braillePatternDots12356: '⡇',
            braillePatternDots456: '⡈',
            braillePatternDots1456: '⡉',
            braillePatternDots2456: '⡊',
            braillePatternDots12456: '⡋',
            braillePatternDots3456: '⡌',
            braillePatternDots13456: '⡍',
            braillePatternDots23456: '⡎',
            braillePatternDots123456: '⡏',
            braillePatternDots7: '⡐',
            braillePatternDots17: '⡑',
            braillePatternDots27: '⡒',
            braillePatternDots127: '⡓',
            braillePatternDots37: '⡔',
            braillePatternDots137: '⡕',
            braillePatternDots237: '⡖',
            braillePatternDots1237: '⡗',
            braillePatternDots47: '⡘',
            braillePatternDots147: '⡙',
            braillePatternDots247: '⡚',
            braillePatternDots1247: '⡛',
            braillePatternDots347: '⡜',
            braillePatternDots1347: '⡝',
            braillePatternDots2347: '⡞',
            braillePatternDots12347: '⡟',
            braillePatternDots57: '⡠',
            braillePatternDots157: '⡡',
            braillePatternDots257: '⡢',
            braillePatternDots1257: '⡣',
            braillePatternDots357: '⡤',
            braillePatternDots1357: '⡥',
            braillePatternDots2357: '⡦',
            braillePatternDots12357: '⡧',
            braillePatternDots457: '⡨',
            braillePatternDots1457: '⡩',
            braillePatternDots2457: '⡪',
            braillePatternDots12457: '⡫',
            braillePatternDots3457: '⡬',
            braillePatternDots13457: '⡭',
            braillePatternDots23457: '⡮',
            braillePatternDots123457: '⡯',
            braillePatternDots67: '⡰',
            braillePatternDots167: '⡱',
            braillePatternDots267: '⡲',
            braillePatternDots1267: '⡳',
            braillePatternDots367: '⡴',
            braillePatternDots1367: '⡵',
            braillePatternDots2367: '⡶',
            braillePatternDots12367: '⡷',
            braillePatternDots467: '⡸',
            braillePatternDots1467: '⡹',
            braillePatternDots2467: '⡺',
            braillePatternDots12467: '⡻',
            braillePatternDots3467: '⡼',
            braillePatternDots13467: '⡽',
            braillePatternDots23467: '⡾',
            braillePatternDots123467: '⡿',
            braillePatternDots567: '⢀',
            braillePatternDots1567: '⢁',
            braillePatternDots2567: '⢂',
            braillePatternDots12567: '⢃',
            braillePatternDots3567: '⢄',
            braillePatternDots13567: '⢅',
            braillePatternDots23567: '⢆',
            braillePatternDots123567: '⢇',
            braillePatternDots4567: '⢈',
            braillePatternDots14567: '⢉',
            braillePatternDots24567: '⢊',
            braillePatternDots124567: '⢋',
            braillePatternDots34567: '⢌',
            braillePatternDots134567: '⢍',
            braillePatternDots234567: '⢎',
            braillePatternDots1234567: '⢏',
            braillePatternDots8: '⢐',
            braillePatternDots18: '⢑',
            braillePatternDots28: '⢒',
            braillePatternDots128: '⢓',
            braillePatternDots38: '⢔',
            braillePatternDots138: '⢕',
            braillePatternDots238: '⢖',
            braillePatternDots1238: '⢗',
            braillePatternDots48: '⢘',
            braillePatternDots148: '⢙',
            braillePatternDots248: '⢚',
            braillePatternDots1248: '⢛',
            braillePatternDots348: '⢜',
            braillePatternDots1348: '⢝',
            braillePatternDots2348: '⢞',
            braillePatternDots12348: '⢟',
            braillePatternDots58: '⢠',
            braillePatternDots158: '⢡',
            braillePatternDots258: '⢢',
            braillePatternDots1258: '⢣',
            braillePatternDots358: '⢤',
            braillePatternDots1358: '⢥',
            braillePatternDots2358: '⢦',
            braillePatternDots12358: '⢧',
            braillePatternDots458: '⢨',
            braillePatternDots1458: '⢩',
            braillePatternDots2458: '⢪',
            braillePatternDots12458: '⢫',
            braillePatternDots3458: '⢬',
            braillePatternDots13458: '⢭',
            braillePatternDots23458: '⢮',
            braillePatternDots123458: '⢯',
            braillePatternDots68: '⢰',
            braillePatternDots168: '⢱',
            braillePatternDots268: '⢲',
            braillePatternDots1268: '⢳',
            braillePatternDots368: '⢴',
            braillePatternDots1368: '⢵',
            braillePatternDots2368: '⢶',
            braillePatternDots12368: '⢷',
            braillePatternDots468: '⢸',
            braillePatternDots1468: '⢹',
            braillePatternDots2468: '⢺',
            braillePatternDots12468: '⢻',
            braillePatternDots3468: '⢼',
            braillePatternDots13468: '⢽',
            braillePatternDots23468: '⢾',
            braillePatternDots123468: '⢿',
            braillePatternDots568: '⣀',
            braillePatternDots1568: '⣁',
            braillePatternDots2568: '⣂',
            braillePatternDots12568: '⣃',
            braillePatternDots3568: '⣄',
            braillePatternDots13568: '⣅',
            braillePatternDots23568: '⣆',
            braillePatternDots123568: '⣇',
            braillePatternDots4568: '⣈',
            braillePatternDots14568: '⣉',
            braillePatternDots24568: '⣊',
            braillePatternDots124568: '⣋',
            braillePatternDots34568: '⣌',
            braillePatternDots134568: '⣍',
            braillePatternDots234568: '⣎',
            braillePatternDots1234568: '⣏',
            braillePatternDots78: '⣐',
            braillePatternDots178: '⣑',
            braillePatternDots278: '⣒',
            braillePatternDots1278: '⣓',
            braillePatternDots378: '⣔',
            braillePatternDots1378: '⣕',
            braillePatternDots2378: '⣖',
            braillePatternDots12378: '⣗',
            braillePatternDots478: '⣘',
            braillePatternDots1478: '⣙',
            braillePatternDots2478: '⣚',
            braillePatternDots12478: '⣛',
            braillePatternDots3478: '⣜',
            braillePatternDots13478: '⣝',
            braillePatternDots23478: '⣞',
            braillePatternDots123478: '⣟',
            braillePatternDots578: '⣠',
            braillePatternDots1578: '⣡',
            braillePatternDots2578: '⣢',
            braillePatternDots12578: '⣣',
            braillePatternDots3578: '⣤',
            braillePatternDots13578: '⣥',
            braillePatternDots23578: '⣦',
            braillePatternDots123578: '⣧',
            braillePatternDots4578: '⣨',
            braillePatternDots14578: '⣩',
            braillePatternDots24578: '⣪',
            braillePatternDots124578: '⣫',
            braillePatternDots34578: '⣬',
            braillePatternDots134578: '⣭',
            braillePatternDots234578: '⣮',
            braillePatternDots1234578: '⣯',
            braillePatternDots678: '⣰',
            braillePatternDots1678: '⣱',
            braillePatternDots2678: '⣲',
            braillePatternDots12678: '⣳',
            braillePatternDots3678: '⣴',
            braillePatternDots13678: '⣵',
            braillePatternDots23678: '⣶',
            braillePatternDots123678: '⣷',
            braillePatternDots4678: '⣸',
            braillePatternDots14678: '⣹',
            braillePatternDots24678: '⣺',
            braillePatternDots124678: '⣻',
            braillePatternDots34678: '⣼',
            braillePatternDots134678: '⣽',
            braillePatternDots234678: '⣾',
            braillePatternDots1234678: '⢿',
            braillePatternBlank: '⠀',

            // Playing Card Suits
            whiteClubSuit: '♣',
            whiteDiamondSuit: '♦',
            whiteHeartSuit: '♥',
            whiteSpadeSuit: '♠',
            blackClubSuit: '♧',
            blackDiamondSuit: '◇',
            blackHeartSuit: '♡',
            blackSpadeSuit: '♤',

            // Logic Symbols
            forAll: '∀',
            exists: '∃',
            notExists: '∄',
            logicalAnd: '∧',
            logicalOr: '∨',
            logicalNot: '¬',
            therefore: '∴',
            because: '∵',
            qed: '∎',

            // Arrows and Directions
            northEastArrow: '↗',
            southEastArrow: '↘',
            southWestArrow: '↙',
            northWestArrow: '↖',
            leftRightArrow: '↔',
            upDownArrow: '↕',
            doubleHeadedArrow: '⇔',
            dashedArrow: '⇢',
            wavyArrow: '↭',

            // Currency Symbols
            afghanis: '؋',
            armenianDram: '֏',
            bengaliRupee: '৳',
            cedi: '₵',
            colon: '₡',
            cruzeiro: '₢',
            dong: '₫',
            drachma: '₯',
            hryvnia: '₴',
            kip: '₭',
            lari: '₾',
            livre: '₤',
            manat: '₼',
            mill: '₥',
            tenge: '₸',
            tugrik: '₮',

            // Special Characters
            trademark: '™',
            registered: '®',
            copyright: '©',
            soundRecording: '℗',
            servicemark: '℠',
            estimated: '℮',
            numero: '№',
            fahrenheit: '℉',
            celsius: '℃',
            ohm: 'Ω',
            micro: 'µ',

            // Geometric Shapes
            blackStar: '★',
            whiteStar: '☆',
            blackCircle: '●',
            whiteCircle: '○',
            blackSquare: '■',
            whiteSquare: '□',
            blackTriangle: '▲',
            whiteTriangle: '△',
            blackDiamond: '◆',
            whiteDiamond: '◇',

            // Musical Symbols
            musicalNote: '♪',
            musicalNotes: '♫',
            musicalEighthNote: '♩',
            musicalBeamedNote: '♬',
            flat: '♭',
            natural: '♮',
            sharp: '♯',

            // Weather and Astronomical
            sun: '☀',
            cloud: '☁',
            umbrella: '☂',
            snowman: '☃',
            comet: '☄',
            star: '⋆',
            blackSun: '☯',

            // Games
            diceOne: '⚀',
            diceTwo: '⚁',
            diceThree: '⚂',
            diceFour: '⚃',
            diceFive: '⚄',
            diceSix: '⚅',
            blackChessKing: '♔',
            whiteChessKing: '♚',
            blackChessQueen: '♕',
            whiteChessQueen: '♛',
            blackChessRook: '♖',
            whiteChessRook: '♜',
            blackChessBishop: '♗',
            whiteChessBishop: '♝',
            blackChessKnight: '♘',
            whiteChessKnight: '♞',
            blackChessPawn: '♙',
            whiteChessPawn: '♟',

            // Additional Symbols
            peace: '☮',
            yinYang: '☯',
            skull: '☠',
            radioactive: '☢',
            biohazard: '☣',
            caduceus: '⚕',
            ankh: '☥',
            crossed: '☒',
            checked: '☑',
            warning: '⚠',
            recycling: '♻',
            fleurDeLis: '⚜',
            scales: '⚖',

            // Punctuation and Typography
            interrobang: '‽',
            invertedInterrobang: '⸘',
            referenceMark: '※',
            pilcrow: '¶',
            section: '§',
            doubleVerticalLine: '‖',
            bulletPoint: '•',
            triangularBullet: '‣',
            hyphen: '‐',
            nonBreakingHyphen: '‑',
            figureDash: '‒',
            enDash: '–',
            emDash: '—',
            horizontalBar: '―',
            swungDash: '〜',

            // Brackets and Quotes
            leftDoubleQuote: '"',
            rightDoubleQuote: '"',
            leftSingleQuote: "'",
            rightSingleQuote: "'",
            lowDoubleQuote: '„',
            lowSingleQuote: '‚',
            angleBracketLeft: '⟨',
            angleBracketRight: '⟩',
            doubleAngleBracketLeft: '《',
            doubleAngleBracketRight: '》',
            cornerBracketLeft: '「',
            cornerBracketRight: '」',
            whiteCornerBracketLeft: '『',
            whiteCornerBracketRight: '』',
        }),
            (this.filteredSymbols = this.getFilteredSymbols()));
    }

    handleInput(e) {
        this.searchTerm = e.target.value;
        this.filteredSymbols = this.getFilteredSymbols();
        this.requestUpdate();
    }

    getFilteredSymbols() {
        return Object.entries(this.symbols).filter(([name]) =>
            this.camelToNormalCase(name)
                .toLowerCase()
                .includes((this.searchTerm || '').toLowerCase())
        );
    }

    copySymbol(symbol) {
        navigator.clipboard.writeText(symbol);
        wisk.utils.showToast('Copied', 2000);
    }

    camelToNormalCase(camelStr) {
        if (!camelStr) return '';

        const specialAcronyms = /([A-Z]{2,})/g;
        const withPreservedAcronyms = camelStr.replace(specialAcronyms, ' $1');

        const spaced = withPreservedAcronyms.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');

        return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
    }

    firstUpdated() {
        this.shadowRoot.querySelector('.search-input').focus();
    }

    render() {
        return html`
            <div class="container">
                <div class="content-area">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Symbols</label>
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${() => {
                                        wisk.editor.hideMiniDialog();
                                    }}"
                                    class="icon"
                                    draggable="false"
                                    style="padding: var(--padding-3); width: unset;"
                                />
                            </div>
                        </div>
                    </div>

                    <input type="text" class="search-input" placeholder="Search symbols..." .value=${this.searchTerm} @input=${this.handleInput} />

                    <div class="symbols-grid">
                        ${this.filteredSymbols.map(
                            ([name, symbol]) => html`
                                <div class="symbol-item" @click=${() => this.copySymbol(symbol)}>
                                    <div class="symbol">${symbol}</div>
                                </div>
                            `
                        )}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('symbols-element', SymbolsElement);
