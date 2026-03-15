"use strict";

let cheatBetterCards = 1; // change to 3 or 4 to get better cards
let cheatOpponentsDontFold = false;

let playIdleVideos = true;

function debug(id, text) {
    console.log(`[${id}] ${text}`)
}

function error(id, text) {
    console.log(`ERROR [${id}] ${text}`)
}

const State ={
    Start: 1,
    Init: 2,
    Intro: 3,
    Deal: 4,
    BetFirst: 5,
    Bet: 6,
    Call: 7,
    Fold: 8,
    Done: 9,
    Broke: 10,
    FinalClip: 11,
    GameDone: 12
}

//**************************************************************************************************************************************** Deck
class Deck {
    static suits = ["Diamonds", "Hearts", "Spades", "Clubs"];
    static ranks = [
        { name: "2", value: 2 },
        { name: "3", value: 3 },
        { name: "4", value: 4 },
        { name: "5", value: 5 },
        { name: "6", value: 6 },
        { name: "7", value: 7 },
        { name: "8", value: 8 },
        { name: "9", value: 9 },
        { name: "10", value: 10 },
        { name: "Jack", value: 11 },
        { name: "Queen", value: 12 },
        { name: "King", value: 13 },
        { name: "Ace", value: 14 }
    ];
    static hierarchy = {
        HighCard: 0,
        Pair: 100,
        TwoPairs: 200,
        Three: 300,
        Straight: 400,
        Flush: 500,
        FullHouse: 600,
        Four: 700,
        StraightFlush: 800
    };

    constructor() {
        this.deck = [];
        let id = 0;
        for (const suit of Deck.suits) {
            for (const rank of Deck.ranks) {
                this.deck.push({img: `img/cards/${id}.png`, suit: suit, name: rank.name, value: rank.value});
                id++;
            }
        }
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    getCards() {
        let res = [];
        for (let i = 0; i < 5; i++) {
            res.push(this.deck.pop());
        }
        res.sort((a, b) => a.value - b.value);
        return [res, this.evaluateHand(res)];
    }

    drawCards(hand) {
        hand.forEach((v, i, a) => {
            if (v.inapt && this.deck.length > 0) {
                this.deck.unshift(a[i]); //FIXME shuffle
                a[i] = this.deck.pop();
            }
        });
        hand.sort((a, b) => a.value - b.value);
        return this.evaluateHand(hand);
    }

    evaluateHand(hand) { // expects sorted hand of 5 cards
        hand.forEach((v, i, a) => a[i].inapt = false)

        // check for flush
        const flushSuit = hand[0].suit;
        const isFlush = hand.every((card) => card.suit === flushSuit);

        // check for straight
        const isStraight =
            hand[0].value + 1 === hand[1].value &&
            hand[1].value + 1 === hand[2].value &&
            hand[2].value + 1 === hand[3].value &&
            hand[3].value + 1 === hand[4].value;

        // check for straight flush
        const isStraightFlush = isFlush && isStraight;

        if (isStraightFlush) {
            const value = hand[4].value;
            return {info: "Straight flush, high " + hand[4].name, value: value + Deck.hierarchy.StraightFlush, hierarchy: Deck.hierarchy.StraightFlush};
        }

        if (isFlush) {
            const value = hand[4].value;
            return {info: "Flush, high " + hand[4].name, value: value + Deck.hierarchy.Flush, hierarchy: Deck.hierarchy.Flush};
        }

        if (isStraight) {
            const value = hand[4].value;
            return {info: "Straight, high " + hand[4].name, value: value + Deck.hierarchy.StraightFlush, hierarchy: Deck.hierarchy.Straight};
        }

        // check for four of a kind
        if (hand[0].value === hand[3].value || hand[1].value === hand[4].value) {
            const value = hand[1].value;
            hand.forEach((v, i, a) => a[i].inapt = (a[i].value != value))
            return {info: "Four of " + hand[1].name, value: value + Deck.hierarchy.Four, hierarchy: Deck.hierarchy.Four};
        }

        // check for full house
        if ((hand[0].value === hand[1].value && hand[2].value === hand[4].value) ||
            (hand[0].value === hand[2].value && hand[3].value === hand[4].value)) {
            const value = hand[2].value;
            return {info: "Full house of " + hand[2].name, value: value + Deck.hierarchy.FullHouse, hierarchy: Deck.hierarchy.FullHouse};
        }

        // check for three of a kind
        if (hand[0].value === hand[2].value ||
            hand[1].value === hand[3].value ||
            hand[2].value === hand[4].value) {
            const value = hand[2].value;
            hand.forEach((v, i, a) => a[i].inapt = (a[i].value != value))
            return {info: "Three of " + hand[2].name, value: value + Deck.hierarchy.Three, hierarchy: Deck.hierarchy.Three};
        }

        // check for two pairs
        if ((hand[0].value === hand[1].value && hand[2].value === hand[3].value) ||
            (hand[0].value === hand[1].value && hand[3].value === hand[4].value) ||
            (hand[1].value === hand[2].value && hand[3].value === hand[4].value)) {
            const pairs = [hand[0].value, hand[1].value, hand[2].value, hand[3].value, hand[4].value];
            const values = pairs.filter((rank, index, arr) => arr.indexOf(rank) !== index);
            hand.forEach((v, i, a) => a[i].inapt = (a[i].value != values[0] && a[i].value != values[1]))
            const high = hand.filter((c) => c.value == values[1])[0];
            return {info: "Two pairs, high " + high.name, value: values[1] + Deck.hierarchy.TwoPairs, hierarchy: Deck.hierarchy.TwoPairs};
        }

        // check for one pair
        if (hand[0].value === hand[1].value || 
            hand[1].value === hand[2].value || 
            hand[2].value === hand[3].value || 
            hand[3].value === hand[4].value) {
            const pairs = [hand[0].value, hand[1].value, hand[2].value, hand[3].value, hand[4].value];
            const value = pairs.filter((rank, index, arr) => arr.indexOf(rank) !== index)[0];
            hand.forEach((v, i, a) => a[i].inapt = (a[i].value != value))
            const high = hand.filter((c) => c.value == value)[0];
            return {info: "One Pair of " + high.name, value: value + Deck.hierarchy.Pair, hierarchy: Deck.hierarchy.Pair};
        }

        // high card
        const value = hand[4].value;
        hand.forEach((v, i, a) => a[i].inapt = (i < 4))
        return {info: "High card " + hand[4].name, value: value + Deck.hierarchy.HighCard, hierarchy: Deck.hierarchy.HighCard};
    }
}

//**************************************************************************************************************************************** Agent
class Agent {
    state = State.Start;

    money = 5000;
    clothes = 4;
    maxClothes = 4;
    cardsHidden = false;

    hand = null;
    evaluation = null;
    static infos = ["", "", "", "", "", "", "", "", "", ""];

    constructor() {

    }

    getMoney() {
        if (this.money >= this.maxClothes * 1000) {
            return this.money - this.maxClothes * 1000;
        } else if (this.money < 1000) {
            return this.money;
        } else {
            return this.money % 1000;
        }
    }

    getClothes() {
        if (this.money >= this.maxClothes * 1000) {
            return this.maxClothes;
        } else if (this.money < 1000) {
            return 0;
        } else {
            return Math.floor(this.money / 1000);
        }
    }

    showMoney() {
        this.ui.money.textContent = "$" + this.getMoney();
        let c = this.getClothes();
        this.ui.cloth1.src = c > 0 ? "img/misc/shirt.png" : "img/misc/shirt-pawn.png";
        this.ui.cloth2.src = c > 1 ? "img/misc/shirt.png" : "img/misc/shirt-pawn.png";
        this.ui.cloth3.src = c > 2 ? "img/misc/shirt.png" : "img/misc/shirt-pawn.png";
        this.ui.cloth4.src = c > 3 ? "img/misc/shirt.png" : "img/misc/shirt-pawn.png";
        this.ui.cloth5.src = c > 4 ? "img/misc/shirt.png" : "img/misc/shirt-pawn.png";
    }

    setMaxClothes(max) {
        this.maxClothes = this.clothes = max;
        if (max < 5) this.ui.cloth5.style.display = "none";
        if (max < 4) this.ui.cloth4.style.display = "none";
        this.money = (parseInt(max) + 1) * 1000; //string?
    }

    showCards() {
        if (this.state >= State.Broke) {
            this.ui.card1.src = "img/cards/transparent.png";
            this.ui.card2.src = "img/cards/transparent.png";
            this.ui.card3.src = "img/cards/transparent.png";
            this.ui.card4.src = "img/cards/transparent.png";
            this.ui.card5.src = "img/cards/transparent.png";
            this.ui.card1.style.backgroundColor = null;
            this.ui.card2.style.backgroundColor = null;
            this.ui.card3.style.backgroundColor = null;
            this.ui.card4.style.backgroundColor = null;
            this.ui.card5.style.backgroundColor = null;
        } else if (this.state >= State.BetFirst) {
            this.ui.card1.src = this.cardsHidden ? "img/cards/flipside.png" : this.hand[0].img;
            this.ui.card2.src = this.cardsHidden ? "img/cards/flipside.png" : this.hand[1].img;
            this.ui.card3.src = this.cardsHidden ? "img/cards/flipside.png" : this.hand[2].img;
            this.ui.card4.src = this.cardsHidden ? "img/cards/flipside.png" : this.hand[3].img;
            this.ui.card5.src = this.cardsHidden ? "img/cards/flipside.png" : this.hand[4].img;
            this.ui.card1.style.opacity = this.hand[0].inapt || this.state >= State.Fold || this.cardsHidden ? 0.5 : 1;
            this.ui.card2.style.opacity = this.hand[1].inapt || this.state >= State.Fold || this.cardsHidden ? 0.5 : 1;
            this.ui.card3.style.opacity = this.hand[2].inapt || this.state >= State.Fold || this.cardsHidden ? 0.5 : 1;
            this.ui.card4.style.opacity = this.hand[3].inapt || this.state >= State.Fold || this.cardsHidden ? 0.5 : 1;
            this.ui.card5.style.opacity = this.hand[4].inapt || this.state >= State.Fold || this.cardsHidden ? 0.5 : 1;
            this.ui.card1.style.backgroundColor = this.hand[0].inapt || this.state >= State.Fold || this.cardsHidden ? null : "black";
            this.ui.card2.style.backgroundColor = this.hand[1].inapt || this.state >= State.Fold || this.cardsHidden ? null : "black";
            this.ui.card3.style.backgroundColor = this.hand[2].inapt || this.state >= State.Fold || this.cardsHidden ? null : "black";
            this.ui.card4.style.backgroundColor = this.hand[3].inapt || this.state >= State.Fold || this.cardsHidden ? null : "black";
            this.ui.card5.style.backgroundColor = this.hand[4].inapt || this.state >= State.Fold || this.cardsHidden ? null : "black";
        }
    }

    deal() {
        this.state = State.BetFirst;
        [this.hand, this.evaluation] = game.deck.getCards();
        this.showCards();
    }

    wins() {
        let w = game.disburse();
        debug(this.id, `wins ${w}`)
        this.money += w;
        this.state = State.Done;
        this.showMoney();
        this.showInfo("win", w, this.evaluation.info);
    }

    loses() {
        debug(this.id, "loses");
        if (this.state != State.Fold) {
            this.showInfo("lose", this.evaluation.info);
        }
        this.state = this.money <= 0 ? State.Broke : State.Done;
    }

    bet(raise = 0) {
        let m = game.deposit(raise, this.money);
        this.money -= m;
        this.state = State.Bet;
        this.showMoney();
        this.showInfo("bet", m - raise, raise);
    }

    call() {
        let m = game.deposit(0, this.money);
        this.money -= m;
        this.state = State.Call;
        this.showMoney();
        this.showInfo("call", m);
    }

    fold() {
        this.state = State.Fold;
        this.showInfo("fold");
        this.showCards();
    }

    draw() {
        let inapt = this.hand.reduce((total, card) => card.inapt ? total + 1 : total, 0);
        let m = game.deposit(0, this.money);
        this.money -= m;
        this.state = State.Bet;
        this.showMoney();
        if (inapt == 0) {
            this.showInfo("bet", m, 0);
        } else {
            this.showInfo("draw", m, inapt);
            this.evaluation = game.deck.drawCards(this.hand);
            this.showCards();
        }
    }

    showInfo(action, a1 = null, a2 = null) {
        let text = action ? this.formatInfo(action, a1, a2) : "&nbsp";
        Agent.infos.shift();
        Agent.infos.push(text);
        game.player.ui.info.innerHTML = Agent.infos.join("<br>");
    }

}

//**************************************************************************************************************************************** Opponent
class Opponent extends Agent {

    config = {};
    frameTime = 1/32;
    pose = 0;
    startpose = -1;
    holdingCards = false;

    playingQueue = [];
    playingVideo = false;
    currentClip = null;
    steppingVideo = false;
    clipEndTime = null;
    stepEndTime = null;
    clipEndTime = null;
    showTimer = null;
    activeVideo = -1;
    nextVideo = -1;

    constructor(index, id) {
        super();
        this.index = index;
        this.id = id;
        this.cardsHidden = true;

        this.ui = {
            video: [document.getElementById(`opponent-${this.index+1}-video1`),
                    document.getElementById(`opponent-${this.index+1}-video2`)],
            card1: document.getElementById(`opponent-${this.index+1}-card-1`),
            card2: document.getElementById(`opponent-${this.index+1}-card-2`),
            card3: document.getElementById(`opponent-${this.index+1}-card-3`),
            card4: document.getElementById(`opponent-${this.index+1}-card-4`),
            card5: document.getElementById(`opponent-${this.index+1}-card-5`),
            money: document.getElementById(`opponent-${this.index+1}-money`),
            cloth1: document.getElementById(`opponent-${this.index+1}-cloth-1`),
            cloth2: document.getElementById(`opponent-${this.index+1}-cloth-2`),
            cloth3: document.getElementById(`opponent-${this.index+1}-cloth-3`),
            cloth4: document.getElementById(`opponent-${this.index+1}-cloth-4`),
            cloth5: document.getElementById(`opponent-${this.index+1}-cloth-5`),
            info1: document.getElementById(`opponent-${this.index+1}-info-1`),
            info2: document.getElementById(`opponent-${this.index+1}-info-2`),
            info3: document.getElementById(`opponent-${this.index+1}-info-3`),
            info4: document.getElementById(`opponent-${this.index+1}-info-4`),
            panel: document.getElementById(`opponent-${this.index+1}-info`)
        }
        this.ui.card1.addEventListener("click", this.cardHandler);
        this.ui.card2.addEventListener("click", this.cardHandler);
        this.ui.card3.addEventListener("click", this.cardHandler);
        this.ui.card4.addEventListener("click", this.cardHandler);
        this.ui.card5.addEventListener("click", this.cardHandler);
        this.ui.video[0].addEventListener('ended', this.videoEnded);
        this.ui.video[1].addEventListener('ended', this.videoEnded);
        this.ui.video[0].addEventListener('canplay', this.videoCanplay);
        this.ui.video[1].addEventListener('canplay', this.videoCanplay);
    }

    cardHandler = () => {
        debug(this.id, "cardHandler");
        this.cardsHidden = !this.cardsHidden;
        this.showCards();
        let mod = this.holdingCards ? "cards" : "nocards";
        this.playVideo("peek", mod);
    }

    videoCanplay = () => {
        //FIXME multiple calls, missing call
        if (this.activeVideo !== this.nextVideo) {
            debug(this.id, `video canplay ${this.currentClip.action} on [${this.nextVideo}]`);
            this.ui.video[this.nextVideo].play()
            this.ui.video[this.nextVideo].hidden = false;
            if (this.activeVideo >= 0) {
                this.ui.video[this.activeVideo].hidden = true;
            } else {
                game.ui.startOverlay.style.display = "none"; //FIXME
            }
            this.activeVideo = this.nextVideo;
        } else {
            debug(this.id, `video double canplay ${this.currentClip.action} on [${this.nextVideo}]`);
            this.ui.video[this.nextVideo].play()
        }
    }

    videoEnded = () => {
        debug(this.id, `video ended ${this.currentClip.action}`);
        if (["strip", "dress"].includes(this.currentClip.action)) {
            game.audio.removeStrip(this.index, this.currentClip.action);
        }
        let ap = ["strip", "dress", "broke"].includes(this.currentClip.action)
        this.playingVideo = false; 
        this.playingSound = false; 
        this.steppingVideo = false;
        this.currentClip = null;
        if (this.state == State.Intro) {
            this.state = State.Deal;
            this.pose = Math.floor(Math.random() * this.config.poses);
        }
        if (this.state == State.FinalClip) {
            this.state = State.GameDone;
        }
        if (ap && game.opponents.every((o) => !o.busy())) {
            game.audio.playEffect("applause");
        }
        this.checkPlayingQueue();
    }

    playIntro() {
        this.state = State.Intro; //FIXME
        this.playVideo("intro");
    }

    interrupting = new Set(["take", "bye", "cheat", "bluff", "peek", "no", "drink"]);

    playVideo(action, mod = null, pose = this.pose, clothes = this.clothes) {

        if ((this.playingVideo || this.playingQueue.length > 0) && this.interrupting.has(action)) {
            debug(this.id, "cancel videos");
            this.playingQueue = [];
            if (this.playingVideo) {
                this.ui.video[this.nextVideo].pause();
                this.videoEnded();
            }
        }

        if (pose != this.pose) {
            let mod = this.holdingCards ? "cards" : "nocards";
            let clip = this.config[`pose_${mod}`][0];
            clip.variant = 0; //FIXME
            let name = `${clip.name}_${this.clothes}_${this.pose}-${pose}_${clip.variant}`
            this.pose = pose;
            debug(this.id, `video enqueue ${name} for clothes ${this.clothes} pose ${this.pose}-${pose}`);
            this.playingQueue.push({name: name, action: "pose"});
        }

        let key = mod ? `${action}_${mod}`: action
        let clips = this.config[key];
        if (!clips) {
            error(this.id, `no video for ${action} ${mod}`);
            return;
        }
        let poskey = `${key}_pos`
        this.config[poskey] = this.config[poskey] == undefined ? Math.floor(Math.random() * clips.length) : (this.config[poskey] + 1) % clips.length;
        let clip = clips[this.config[poskey]];
        clip.variant = clip.variant == undefined ? Math.floor(Math.random() * clip.variants) : (clip.variant + 1) % clip.variants;
        let posename = pose;
        let clothesname = clothes;
        if (clip.switch_pose) {
            let newpose = pose == this.pose ? (pose + 1) % this.config.poses : pose; //FIXME
            posename = `${this.pose}-${newpose}`
            this.pose = newpose;
        } else if (this.pose != pose) {
            this.pose = pose; // shouldn't happen
        }
        if (clip.switch_clothes) {
            let newclothes = clothes == this.clothes ? (clothes + 1) % this.config.clothes : clothes; //FIXME
            clothesname = `${this.clothes}-${newclothes}`
            this.clothes = newclothes;
        } else if (this.clothes != clothes) {
            this.clothes = clothes; // shouldn't happen
        }
        let name = `${clip.name}_${clothesname}_${posename}_${clip.variant}`
        debug(this.id, `video enqueue ${name} for ${action} ${mod} clothes ${clothesname} pose ${posename}`);
        this.playingQueue.push({name: name, action: action});
        if (action == "take") {
            this.holdingCards = true;
        }
        if (action == "win" || action == "lose") {
            this.holdingCards = false;
        }
        this.checkPlayingQueue();
    }

    checkPlayingQueue() {
        if (!this.playingVideo && this.playingQueue.length > 0) {
            if (this.showTimer) {
                clearTimeout(this.showTimer);
                this.showTimer = null;
                debug(this.id, "show timer cancel");
            }
            this.currentClip = this.playingQueue.shift();
            this.playingVideo = true;
            this.nextVideo = this.nextVideo == 0 ? 1 : 0;
            this.ui.video[this.nextVideo].src = `${this.config.base}/${this.currentClip.name}${this.config.suffix}`
            this.ui.video[this.nextVideo].load();
            debug(this.id, `video start ${this.currentClip.name} for ${this.currentClip.action} on [${this.nextVideo}]`);
            if (["strip", "dress"].includes(this.currentClip.action)) {
                game.audio.addStrip(this.index, this.currentClip.action);
            }
            if (["finalwin", "finallose"].includes(this.currentClip.action)) {
                game.audio.addStrip(this.index, this.currentClip.action);
                this.state = State.FinalClip;
            }
        } else if (playIdleVideos && this.state < State.FinalClip) {
            let timeout = 4000 + Math.random() * 8000 * game.opponents.length;
            this.showTimer = setTimeout(() => {
                debug(this.id, `show timer execute ${this.showTimer}`);
                if (this.showTimer && !this.playingVideo && !this.playingQueue.length && this.state >= State.BetFirst) {
                    this.showTimer = null; //FIXME fired but not executed before checkPlayingQueue()
                    let mod = this.holdingCards ? "cards" : "nocards";
                    this.playVideo("show", mod); 
                }
            }, timeout);
            debug(this.id, `show timer start ${this.showTimer} ${timeout}ms`);
        }
        game.stateChanged("playing");
    }

    deal() {
        super.deal();
        //play video after draw()
    }

    activate() {
        if (game.agents.some((a) => a.state == State.Call)) {
            this.activateCall()
        } else {
            let raise = 0;
            let rnd = Math.random();
            let canFold = !cheatOpponentsDontFold || game.player.state >= State.Fold;
            if (this.evaluation.hierarchy >= Deck.hierarchy.Three) raise = 20;
            if (this.evaluation.hierarchy >= Deck.hierarchy.Flush) raise = 50;
            if (this.evaluation.hierarchy >= Deck.hierarchy.Four) raise = 100;
            if (this.state == State.BetFirst) {
                this.draw();
                this.startpose = this.startpose == this.pose ? Math.floor(Math.random() * this.config.poses) : this.pose;
                let mod = this.evaluation.value >= (Deck.hierarchy.Pair + Deck.ranks[9].value) ? "good" : "bad";
                this.playVideo("take", mod, this.startpose);
            } else if (canFold && this.evaluation.hierarchy < Deck.hierarchy.Pair && rnd > 0.3) {
                this.fold();
                this.playVideo("lose");
            } else if (canFold && (this.money <= game.minWager + raise || ((rnd > 0.2 && rnd > this.evaluation.value / Deck.hierarchy.Straight) || rnd > 0.95))) {
                debug(this.id, `call with ${rnd.toFixed(2)} ${this.evaluation.value}/${Deck.hierarchy.Straight}`)
                this.call();
            } else {
                this.bet(raise);
            }
        }
    }

    activateCall() {
        if (this.evaluation.hierarchy < Deck.hierarchy.TwoPairs) {
            this.fold();
            this.playVideo("lose");
        } else {
            this.call();
        }
    }

    wins() {
        super.wins();
        this.playVideo("win");
        while (this.clothes < this.getClothes()) {
            this.playVideo("dress", null, this.pose, this.clothes + 1);
        }
    }

    loses() {
        if (this.state != State.Fold) {
            this.playVideo("lose");
        }
        while (this.clothes > this.getClothes()) {
            this.playVideo("strip", null, this.pose, this.clothes - 1);
        }
        super.loses();
        // if (this.state == State.Broke) {
        //     this.playVideo("broke");
        //     this.showCards();
        // }
    }

    completed() {
        if (this.state == State.Broke) {
            this.playVideo("finallose", null, 0, 0);
        } else {
            this.playVideo("finalwin", null, 0, 3);
        }
    }

    formatInfo(action, a1, a2) {
        switch (action) {
            case "win":
                return `${this.config.name} wins $${a1}, ${a2}`;
            case "lose":
                return `${this.config.name} loses, ${a1}`;
            case "bet":
                return a2 ? `${this.config.name} bets $${a1} and raises $${a2}` : `${this.config.name} bets $${a1}`;
            case "call":
                return `${this.config.name} bets $${a1} and calls`;
            case "draw":
                return `${this.config.name} bets $${a1} and draws ${a2} cards`;
            case "fold":
                return `${this.config.name} folds`;
            default:
                return `${this.config.name} ${action}`;
        }
    }

    busy() {
        return ((this.currentClip && this.currentClip.action != "show" && this.currentClip.action != "no") || 
                this.playingQueue.some((c) => (c.action != "show" && c.action != "no")));
    }
}

//**************************************************************************************************************************************** Player
class Player extends Agent {

    id = "player";
    confirmCallback = null;
    active = false;

    constructor() {
        super();

        this.ui = {
            card1: document.getElementById(`player-card-1`),
            card2: document.getElementById(`player-card-2`),
            card3: document.getElementById(`player-card-3`),
            card4: document.getElementById(`player-card-4`),
            card5: document.getElementById(`player-card-5`),
            money: document.getElementById(`player-money`),
            cloth1: document.getElementById(`player-cloth-1`),
            cloth2: document.getElementById(`player-cloth-2`),
            cloth3: document.getElementById(`player-cloth-3`),
            cloth4: document.getElementById(`player-cloth-4`),
            cloth5: document.getElementById(`player-cloth-5`),
            start: document.getElementById(`player-start`),
            load: document.getElementById(`player-load`),
            ok: document.getElementById(`player-ok`),
            wait: document.getElementById(`player-wait`),
            fold: document.getElementById(`player-fold`),
            draw: document.getElementById(`player-draw`),
            call: document.getElementById(`player-call`),
            bet1: document.getElementById(`player-bet1`),
            bet2: document.getElementById(`player-bet2`),
            bet3: document.getElementById(`player-bet3`),
            bet4: document.getElementById(`player-bet4`),
            bet5: document.getElementById(`player-bet5`),
            info: document.getElementById(`player-info`),
            panel: document.getElementById(`player`),
        }
        this.ui.card1.addEventListener("click", this.card1handler);
        this.ui.card2.addEventListener("click", this.card2handler);
        this.ui.card3.addEventListener("click", this.card3handler);
        this.ui.card4.addEventListener("click", this.card4handler);
        this.ui.card5.addEventListener("click", this.card5handler);
        this.ui.start.addEventListener("click", this.startHandler);
        this.ui.ok.addEventListener("click", this.okHandler);
        this.ui.fold.addEventListener("click", this.foldHandler);
        this.ui.draw.addEventListener("click", this.drawHandler);
        this.ui.call.addEventListener("click", this.callHandler);
        this.ui.bet1.addEventListener("click", this.bet1handler);
        this.ui.bet2.addEventListener("click", this.bet2handler);
        this.ui.bet3.addEventListener("click", this.bet3handler);
        this.ui.bet4.addEventListener("click", this.bet4handler);
        this.ui.bet5.addEventListener("click", this.bet5handler);
    }

    card1handler = () => {
        debug(this.id, "card1handler");
        this.hand[0].inapt = !this.hand[0].inapt;
        this.showCards();
        this.disableButtons();
    }

    card2handler = () => {
        debug(this.id, "card2handler");
        this.hand[1].inapt = !this.hand[1].inapt;
        this.showCards();
        this.disableButtons();
    }

    card3handler = () => {
        debug(this.id, "card3handler");
        this.hand[2].inapt = !this.hand[2].inapt;
        this.showCards();
        this.disableButtons();
    }

    card4handler = () => {
        debug(this.id, "card4handler");
        this.hand[3].inapt = !this.hand[3].inapt;
        this.showCards();
        this.disableButtons();
    }

    card5handler = () => {
        debug(this.id, "card5handler");
        this.hand[4].inapt = !this.hand[4].inapt;
        this.showCards();
        this.disableButtons();
    }

    startHandler = () => {
        debug(this.id, "startHandler");
        this.ui.start.hidden = true;
        this.ui.wait.hidden = false;
        this.ui.info.hidden = false;
        game.start();
    }

    okHandler = () => {
        debug(this.id, "okHandler");
        if (this.confirmCallback) {
            let cb = this.confirmCallback;
            this.confirmCallback = null;
            cb();
        }
    }

    foldHandler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "foldHandler");
            this.showInfo("fold");
            this.state = State.Fold;
            game.endRound();
        }
    }

    drawHandler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "drawHandler");
            game.audio.playEffect("coins");
            this.draw();
            game.endRound();
        }
    }

    callHandler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "callHandler");
            game.audio.playEffect("coins");
            this.call();
            game.endRound();
        }
    }

    bet1handler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "bet1handler");
            game.audio.playEffect("coins");
            this.bet(0);
            this.state = State.Bet;
            game.endRound();
        }
    }

    bet2handler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "bet2handler");
            game.audio.playEffect("coins");
            this.bet(10);
            this.state = State.Bet;
            game.endRound();
        }
    }

    bet3handler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "bet3handler");
            game.audio.playEffect("coins");
            this.bet(20);
            this.state = State.Bet;
            game.endRound();
        }
    }

    bet4handler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "bet4handler");
            game.audio.playEffect("coins");
            this.bet(50);
            this.state = State.Bet;
            game.endRound();
        }
    }

    bet5handler = () => {
        if (this.active) {
            this.active = false;
            debug(this.id, "bet5handler");
            game.audio.playEffect("coins");
            this.bet(100);
            this.state = State.Bet;
            game.endRound();
        }
    }

    disableButtons() {
        let video = game.busy() || game.opponents.some((o) => o.busy()) || game.waitExit;
        let call = game.opponents.reduce((total, o) => o.state == State.Call ? total + 1 : total, 0);

        this.ui.ok.hidden = video;
        this.ui.wait.hidden = !video;

        if (this.state == State.GameDone || this.confirmCallback) {
            this.ui.ok.disabled = video;
            this.ui.ok.textContent = this.state == State.GameDone ? "Exit" : "OK";
        } else {
            this.ui.ok.disabled = true;
        }

        this.ui.call.textContent = `$${game.minWager} Call`;
        this.ui.draw.textContent = `$${game.minWager} Draw`;
        this.ui.bet1.innerHTML = `$${game.minWager}<br>&nbsp;<br>Bet`;
        this.ui.bet2.innerHTML = `$${game.minWager}<br>+<br>$10`;
        this.ui.bet3.innerHTML = `$${game.minWager}<br>+<br>$20`;
        this.ui.bet4.innerHTML = `$${game.minWager}<br>+<br>$50`;
        this.ui.bet5.innerHTML = `$${game.minWager}<br>+<br>$100`;

        if (this.state == State.GameDone || this.confirmCallback || (this.state != State.BetFirst && this.state != State.Bet)) {
            this.ui.fold.disabled = true;
            this.ui.call.disabled = true;
            this.ui.bet1.disabled = true;
            this.ui.bet2.disabled = true;
            this.ui.bet3.disabled = true;
            this.ui.bet4.disabled = true;
            this.ui.bet5.disabled = true;
        } else {
            this.ui.fold.disabled = video;
            this.ui.call.disabled = video;
            this.ui.bet1.disabled = this.money >= game.minWager ? video | call: true;
            this.ui.bet2.disabled = this.money >= game.minWager + 10 ? video | call : true;
            this.ui.bet3.disabled = this.money >= game.minWager + 20 ? video | call : true;
            this.ui.bet4.disabled = this.money >= game.minWager + 50 ? video | call : true;
            this.ui.bet5.disabled = this.money >= game.minWager + 100 ? video | call : true;
        }

        if (!this.hand || this.hand.every((v) => !v.inapt) || this.state == State.GameDone || this.confirmCallback || this.state != State.BetFirst) {
            this.ui.draw.disabled = true;
        } else {
            this.ui.draw.disabled = this.money >= game.minWager ? video : true;
        }

        game.hideGui(); //FIXME
    }

    deal() {
        this.state = State.BetFirst;
        [this.hand, this.evaluation] = game.deck.getCards();
        for (let i = cheatBetterCards; i > 0; i--) {
            this.evaluation = game.deck.drawCards(this.hand);
        }
        this.showCards();
    }

    activate() {
        this.active = true;
        this.disableButtons();
    }

    completed(callback) {
        this.confirmCallback = callback;
        this.showInfo(this.state == State.Broke ? "lose-game" : "win-game");
        this.state = State.GameDone;
        this.disableButtons();        
    }

    confirm(callback) {
        this.confirmCallback = callback;
        this.disableButtons();
    }

    formatInfo(action, a1, a2) {
        switch (action) {
            case "deal":
                return "";
            case "win":
                return `&nbsp;I win $${a1}, ${a2}`;
            case "lose":
                return `&nbsp;I lose, ${a1}`;
            case "bet":
                return a2 ? `&nbsp;I bet $${a1} and raise $${a2}` : `&nbsp;I bet $${a1}`;
            case "call":
                return `&nbsp;I bet $${a1} and call`;
            case "draw":
                return `&nbsp;I bet $${a1} and draw ${a2} cards`;
            case "fold":
                return `&nbsp;I fold`;
            case "lose-game":
                return `&nbsp;I lost the game.`;
            case "win-game":
                return `&nbsp;I won the game.`;
            default:
                return `&nbsp;I ${action}`;
        }
    }

}

//**************************************************************************************************************************************** Audio
class Audio {
    effects = {
        "shuffle": [...Array(3).keys()].map((i) => `audio/effects/shuffle${i+1}.mp3`),
        "coins": [...Array(10).keys()].map((i) => `audio/effects/coins${i+1}.mp3`),
        "applause": [...Array(8).keys()].map((i) => `audio/effects/applause${i+1}.mp3`)
    }

    state = "ambient";
    currentAmbient = 0;
    dimAmbientVolume = true;
    activeStrip = new Set();
    activeAction = {};
    currentStrip = null;

    constructor(dim, config) {
        this.dimAmbientVolume = dim;
        this.ambientMusic = config.tracks; //FIXME: more than one opponent
        this.startVolume = config.startVolume;
        this.dimmedVolume = config.dimmedVolume;
        this.endVolume = config.endVolume;
        this.dimStep = config.dimStep;
        this.music = document.getElementById("music");
        this.music.volume = this.startVolume;
        this.effect = document.getElementById("effect");
        //this.music.onerror = () => this.ended(true); // no strip audio available
        this.music.onended = () => this.ended();
        this.music.onpause = () => this.ended();
        //this.currentAmbient = Math.floor(Math.random() * this.ambientMusic.length);
        this.ended();
        this.dimAmbient(true);
    }

    dimAmbient(dim = this.dimAmbientVolume) {
        if (this.dimAmbientVolume != dim) {
            debug("audio", `dim volume ${this.dimAmbientVolume} => ${dim}`);
            this.dimAmbientVolume = dim;
            if (this.state == "ambient" && !this.ambientworker) {
                let target = this.dimAmbientVolume ? this.dimmedVolume : 1;
                this.ambientworker = setInterval(() => {
                    if (this.state == "ambient" && this.dimAmbientVolume) {
                        let v = this.music.volume - this.dimStep;
                        if (v <= this.dimmedVolume) {
                            this.music.volume = this.dimmedVolume;
                            clearInterval(this.ambientworker);
                            this.ambientworker = null;
                            debug("audio", "dim volume done");
                        } else {
                            this.music.volume = v;
                            debug("audio", `dim volume ${v}`);
                        }
                    } else if (this.state == "ambient" && !this.dimAmbientVolume) {
                        let v = this.music.volume + this.dimStep;
                        if (v >= this.endVolume) {
                            this.music.volume = this.endVolume;
                            clearInterval(this.ambientworker);
                            this.ambientworker = null;
                            debug("audio", "dim volume done");
                        } else {
                            this.music.volume = v;
                            debug("audio", `dim volume ${v}`);
                        }
                    } else {
                        clearInterval(this.ambientworker);
                        this.ambientworker = null;
                    }
                }, 200);
            }
        }
    }

    ended() {
        if (this.activeStrip.size) {
            let nr = Array.from(this.activeStrip);
            nr = nr[Math.floor(Math.random() * nr.length)];
            this.music.volume = 1;
            let music = game.opponents[nr].config[`${this,this.activeAction[nr]}_music`];
            this.music.src = music[0]["file"]; //FIXME
            this.state = "strip";
            this.currentStrip = nr;
            debug("audio", `playing ${this.music.src}`)
            this.music.play();
        } else {
            this.music.src = this.ambientMusic[this.currentAmbient];
            this.music.volume = this.dimAmbientVolume ? this.dimmedVolume : 1;
            this.currentStrip = null;
            this.state = "ambient";
            debug("audio", `playing ${this.music.src}`)
            this.music.play();
            this.currentAmbient = (this.currentAmbient + 1) % this.ambientMusic.length;
        }
    }

    addStrip(nr, action) {
        this.activeStrip.add(nr);
        this.activeAction[nr] = action;
        if (this.state == "fadeout") {
            this.music.volume = 1;
            clearInterval(this.worker);
            this.state = "stopped";
            this.worker = null;
            debug("audio", "cancle fadeout, continue strip");
        } else if (this.state == "ambient") {
            this.state = "stopped";
            this.music.pause();
            debug("audio", "stop ambient");
        }
    }

    removeStrip(nr) {
        this.activeStrip.delete(nr);
        if (this.activeStrip.size == 0) {
            this.state = "fadeout";
            debug("audio", "start fadeout");
            this.worker = setInterval(() => {
                if (this.state == "fadeout") {
                    let v = this.music.volume - 0.05;
                    if (v <= 0) {
                        clearInterval(this.worker);
                        this.state = "stopped";
                        this.worker = null;
                        this.music.pause();
                        debug("audio", "fadeout, stop strip");
                    } else {
                        this.music.volume = v;
                        debug("audio", `fadeout, volume ${v}`);
                    }
                }
            }, 100);
        }
    }

    playEffect(effect) {
        let e = this.effects[effect];
        e = e[Math.floor(Math.random() * e.length)];
        this.effect.src = e;
        this.effect.play();
    }
}

//**************************************************************************************************************************************** Game
class Game {
    error = false;
    loaded = false
    started = false;
    waitExit = false;
    quitCounter = 0;
    delay = false;
    uiHidden = false;
    uiAutohide = true;

    opponents = [];
    player = null;
    agents = [];
    audio = null;

    potMoney = 0;
    minWager = 10;
    zoom = false;

    static coinId = [   0,   10,   20,   30,   40,   50,   60,   70,   80,   90,
                      100,  110,  120,  130,  140,  150,  160,  170,  180,  190, 
                      200,  250,  300,  350,  400,  450,  500,  550,  600,  650,
                      700,  800, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, Infinity];

    constructor() {
    }

    init () {
        this.initAgents();
        this.initUI();
    }

    initAgents() {
        for (let i = 0; i < selectedOpponents.length; i++) {
            let id = selectedOpponents[i];
            debug(id, `opponent ${id}`);
            let opponent = new Opponent(this.opponents.length, id);
            this.opponents.push(opponent);
            this.agents.push(opponent);
            if (id in fpsFromLocalFile) {
                opponent.frameTime = 1 / fpsFromLocalFile[id];
            }
            opponent.config = loadedFromLocalFile[id];
            opponent.setMaxClothes(opponent.config.clothes - 1);
        }
        this.player = new Player();
        this.agents.push(this.player);
    }

    initUI() {
        this.ui = {
            quit: document.getElementById("quit"),
            cheat: document.getElementById("cheat"),
            bluff: document.getElementById("bluff"),
            hide: document.getElementById("hide"),
            autohide: document.getElementById("autohide"),
            //drinkImg: document.getElementById("drink-img"),
            pot: document.getElementById("pot"),
            potImg: document.getElementById("pot-img"),
            potMoney: document.getElementById("pot-money"),
            fullscreen: document.getElementById("fullscreen"),
            startOverlay: document.getElementById(`start-overlay`),
            load: document.getElementById(`player-load`),
            start: document.getElementById(`player-start`),
        }
        this.ui.fullscreen.addEventListener("click", this.toggleFullscreen);
        //this.ui.drinkImg.addEventListener("click", () => this.drink());
        this.ui.quit.addEventListener("click", () => this.quit());
        this.ui.cheat.addEventListener("click", () => this.talk("cheat"));
        this.ui.bluff.addEventListener("click", () => this.talk("bluff"));
        this.ui.hide.addEventListener("click", () => this.toogleHide());
        this.ui.autohide.addEventListener("click", () => this.toogleAutohide());
        this.ui.load.hidden = true;
        this.ui.start.hidden = false;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement &&    // standard
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // Vendor prefixes
            debug("game", "switch to fullscreen")
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {  // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {  // Chrome, Safari and Opera
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {  // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
        } else {
            debug("game", "switch to window mode")
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {  // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {  // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {  // IE/Edge
                document.msExitFullscreen();
            }
        }
    }

/*     drink() {
        let rnd = Math.random();
        for (let o of this.opponents) {
            let [action, mod] = rnd > 0.7 ? ["no", o.state >= State.Fold ? "none" : "cards"] : ["show", "drink"];
            if (o.playingQueue.some((c) => (c.mod == "drink" || c.action == "no"))) {
                debug("game", `${o.id} drink already in queue`);
            } else if ("show-drink-any-any" in o.clips) {
                debug("game", `${o.id} ${action} ${mod}`);
                o.playVideo(action, mod);
            } else {
                debug("game", `${o.id} no drink clips`);
            }
        }
    }
 */
    quit() {
        if (!this.started) {
            //################################################### End of program
            location.href = "index.html";
        } else if (this.quitCounter > 0) {
            this.waitExit = true;
            this.stateChanged();
        } else {
            this.quitCounter++;
            this.ui.quit.style.backgroundColor = "red";
            for (let o of this.opponents) {
                let mod = o.holdingCards ? "cards" : "nocards";
                o.playVideo("bye", mod);
            }
        }
    }

    talk(action) {
        for (let o of this.opponents) {
            let mod = o.holdingCards ? "cards" : "nocards";
            o.playVideo(action, mod);
        }
    }

    hideGui() {
        this.ui.hide.innerText = this.uiHidden ? "Show" : "Hide";
        this.ui.autohide.style.backgroundColor = this.uiAutohide ? "#ffffff" : null; //FIXME add class
        this.ui.autohide.style.outline = this.uiAutohide ? "2px solid white" : "";
        let h1 = this.uiHidden;
        let h2 = this.uiAutohide && (game.busy() || game.opponents.some((o) => o.busy()) || game.waitExit);

        this.ui.pot.style.visibility = h1 || h2 ? "hidden" : "";
        this.ui.fullscreen.style.visibility =  h1 || h2 ? "hidden" : "";
        this.ui.hide.style.visibility =  h2 ? "hidden" : "";
        this.ui.autohide.style.visibility =  h1 ? "hidden" : "";
        this.player.ui.panel.style.visibility =  h1 || h2 ? "hidden" : "";
        this.opponents.forEach((o) => o.ui.panel.style.visibility =  h1 || h2 ? "hidden" : "");
    }

    toogleHide() {
        this.uiHidden = !this.uiHidden;
        this.hideGui();
    }

    toogleAutohide() {
        this.uiAutohide = !this.uiAutohide;
        this.hideGui();
    }

    exit() {
        // for (let o of this.opponents) {
        //     o.playVideo("bye", "none");
        // }
        this.waitExit = true;
        this.stateChanged();
    }

    start() {
        this.hideGui();
        //this.ui.startOverlay.style.display = "none";
        this.audio = new Audio(false, this.opponents[0].config);
        this.loaded = true;
        for (let o of this.opponents) {
            o.playIntro();
        }
    }

    stateChanged() {
        if (this.opponents.some(o => o.state == State.Start)) {
            debug("game", "state Start, waiting");
            return;
        }
        if (this.opponents.some(o => o.state == State.Init)) {
            debug("game", "state Init, waiting");
            return;
        }
        if (!this.loaded && this.opponents.some(o => o.state == State.Intro)) {
            debug("game", "state Intro, waiting");
            return;
        }
        if (!this.started && this.opponents.every(o => o.state == State.Deal)) {
            debug("game", "state Deal, dealing");
            //this.ui.drinkImg.hidden = false;
            this.ui.cheat.hidden = false;
            this.ui.bluff.hidden = false;
            this.started = true;
            this.deal();
            return;
        }
        if (this.waitExit) {
            let video = game.opponents.some((o) => o.busy());
            if (!video) {
                //################################################### End of program
                location.href = "index.html";
            }
        }
        if (this.opponents.every(o => o.state == State.GameDone)) {
            debug("game", "state Game Done");
            //this.audio.dimAmbient(false);
            this.ui.cheat.hidden = true;
            this.ui.bluff.hidden = true;
            this.ui.quit.hidden = true;
            this.player.completed(() => this.exit());
            return;
        }
        this.player.disableButtons();
    }

    showPot() {
        this.ui.potMoney.textContent = "$" + this.potMoney;
        this.ui.potMoney.hidden = this.potMoney == 0;
        this.ui.potImg.src = `img/coins/${Game.coinId.reduce((t, v, i) => (v <= this.potMoney) ? i : t, 0)}.png`;
    }

    deposit(raise, max) {
        let amount = this.minWager + raise;
        if (amount > max) amount = max;
        this.minWager += raise;
        this.potMoney += amount;
        this.showPot();
        return amount;
    }

    disburse() {
        let r = game.potMoney;
        this.potMoney = 0;
        this.minWager = 10;
        this.showPot();
        return r;
    }

    deal() {
        this.player.showInfo("deal");
        if (this.agents.reduce((total, o) => o.state == State.Broke ? total : total + 1, 0) > 1) {
            this.audio.playEffect("shuffle");
            this.deck = new Deck();
            for (let o of this.opponents.filter((o) => o.state != State.Broke)) {
                o.deal();
            }
            this.player.deal();
            this.startRound();
        } else {
            for (let o of this.opponents) {
                o.completed();
            }
        }
    }

    startRound() {
        if (this.quitCounter) {
            this.quitCounter = 0;
            this.ui.quit.style.backgroundColor = null;
        }

        //The opponents start each round, and the user goes last.
        for (let o of this.opponents.filter((o) => o.state != State.Fold && o.state != State.Broke)) {
            o.activate();
        }
        let active = this.agents.reduce((total, o) => o.state == State.Fold || o.state == State.Broke ? total : total + 1, 0);
        if (active >= 2 && (this.player.state == State.BetFirst || this.player.state == State.Bet)) {
            this.player.activate();
        } else {
            this.endRound();
        }
    }

    endRound() {
        let active = [];
        let winner = null;
        let call = this.agents.some((a) => a.state == State.Call)
        if (call) {
            this.opponents.forEach((o) =>  o.state == State.BetFirst || o.state == State.Bet ? o.activateCall() : null);
        }
        active = this.agents.filter((a) => a.state != State.Fold && a.state != State.Broke);

        if (active.length == 0) { //???
            winner = this.player;
        } else if (active.length == 1) {
            winner = active[0];
        } else if (call) {
            winner = this.player;
            active.filter((p) => p != this.player).forEach((o) => {
                if (o.evaluation.value > winner.evaluation.value) {
                    winner = o;
                }
            });
        }
        if (winner) {
            this.agents.filter((o) => o != winner && o.state != State.Broke).forEach((o) => o.loses());
            winner.wins();
            this.player.confirm(() => this.deal());
        } else {
            this.delay = true;
            this.player.disableButtons();
            setTimeout(() => {
                this.delay = false;
                this.startRound();
            }, 600);
        }
        if (Math.random() < 0.1) this.zoom = false;
        if (Math.random() > 0.9) this.zoom = true;
    }

    busy() {
        this.delay;
    }
}

//**************************************************************************************************************************************** Resizer

class Resizable {
    static barSize = 10;
    static mouseoverArea;
    static activeResizers = [];

    static init() {
        Resizable.mouseoverArea = document.getElementsByTagName("body")[0];

        for (let s of document.getElementsByClassName("horizontal-splitter")) {
            Resizable.activeResizers.push(new Resizable(s, true));
        }
        for (let s of document.getElementsByClassName("vertical-splitter")) {
            Resizable.activeResizers.push(new Resizable(s, false));
        }
    }

    constructor(splitter, horizontal) {
        this.splitter = splitter;
        this.horizontal = horizontal;
        this.content1 = splitter.children[0];
        this.bar = splitter.children[1];
        this.content2 = splitter.children[2];

        this.start = (e) => {
            //debug("Resizer", "start");
            e.preventDefault();
            e.stopPropagation();
            this.startPointerX = e.clientX;
            this.startPointerY = e.clientY;
            this.startW1 = this.content1.offsetWidth;
            this.startH1 = this.content1.offsetHeight;
            this.startW = this.splitter.offsetWidth;
            this.startH = this.splitter.offsetHeight;
            Resizable.mouseoverArea.addEventListener("pointermove", this.move);
            Resizable.mouseoverArea.addEventListener("pointerup", this.end);
        }

        this.move = (e) => {
            let x = e.clientX - this.startPointerX;
            let y = e.clientY - this.startPointerY;
            let p1 = 0;
            let p2 = 0;
            if (horizontal) {
                let w1 = this.startW1 + x;
                p1 = Math.round(w1 / (this.startW - Resizable.barSize) * 100);
                p1 = Math.min(Math.max(p1, 5), 95); //FIXME
                p2 = 100 - p1;
                this.splitter.style["grid-template-columns"] = `calc(${p1}% - ${Resizable.barSize/2}px)  ${Resizable.barSize}px  calc(${p2}% - ${Resizable.barSize/2}px)`;
            } else {
                let h1 = this.startH1 + y;
                p1 = Math.round(h1 / (this.startH - Resizable.barSize) * 1000) / 10;
                p1 = Math.min(Math.max(p1, 5), 95); //FIXME
                p2 = 100 - p1;
                this.splitter.style["grid-template-rows"] = `calc(${p1}% - ${Resizable.barSize/2}px)  ${Resizable.barSize}px  calc(${p2}% - ${Resizable.barSize/2}px)`;
            }
            //debug("Resizer", `move ${e.pageX} ${e.pageY} -> ${x} ${y} -> ${p1}% ${p2}%`);
        }

        this.end = (e) => {
            //debug("Resizer", "end");
            Resizable.mouseoverArea.removeEventListener("pointermove", this.move);
            Resizable.mouseoverArea.removeEventListener("pointerup", this.end);
        }

        this.bar.addEventListener("pointerdown", this.start);
    }

    static currentFullsizeContent = null;
    static currentFullsizeGrid1 = null;
    static currentFullsizeGrid2 = null;
}

function toggleSplitter(content, part1, resize1, part2 = null, resize2 = null) {
    //resize1 horizontal, if exists resize2 vertical
    debug("toggle Resizer", `${content}, ${part1}, ${resize1}, ${part2}, ${resize2}`)
    if (Resizable.currentFullsizeContent) {
        let s = document.getElementById(resize1);
        s.children[1].style.display = "";
        s.children[part1 == 0 ? 2 : 0].style.display = "";
        s.style["grid-template-columns"] = Resizable.currentFullsizeGrid1;
        if (resize2) {
            s = document.getElementById(resize2);
            s.children[1].style.display = "";
            s.children[part2 == 0 ? 2 : 0].style.display = "";
            s.style["grid-template-rows"] = Resizable.currentFullsizeGrid2;
        }
        content.style.cursor = "zoom-in";
        Resizable.currentFullsizeContent = null;
    } else {
        let s = document.getElementById(resize1);
        Resizable.currentFullsizeGrid1 = s.style["grid-template-columns"];
        s.children[1].style.display = "none";
        s.children[part1 == 0 ? 2 : 0].style.display = "none";
        s.style["grid-template-columns"] = "100%";
        if (resize2) {
            s = document.getElementById(resize2);
            Resizable.currentFullsizeGrid2 = s.style["grid-template-rows"];
            s.children[1].style.display = "none";
            s.children[part2 == 0 ? 2 : 0].style.display = "none";
            s.style["grid-template-rows"] = "100%";
        }
        content.style.cursor = "zoom-out";
        Resizable.currentFullsizeContent = content;
    }
}

//**************************************************************************************************************************************** Start
const game = new Game();

window.addEventListener('load', function() {
    debug("load", "start...");
    Resizable.init();
    game.init();
});