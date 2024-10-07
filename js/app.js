// run with npx serve

import { ref } from 'vue'
export default {
	setup() {
		var numChars = 4;
		const maxguesses = 12;
		var guesses = ref([]);
		var curguessnum = ref(1);
		var curguess = ref('');
		var solved = ref(false);
		var errmsg = ref("");
		var errmsgs = ref([]);
		var errtimeout;
		var active = true;
		
		var validWords = [];
		fetch('wordlists/wordlist' + numChars + '.txt')
			.then(response => response.text())
			.then((data) => {
				validWords = data.split("\r\n");
		});
		
		var word = 'XXXX';
		fetch('wordlists/wordlist' + numChars + '_selection.txt')
			.then(response => response.text())
			.then((data) => {
				let selectionWords = data.split("\r\n");
				word = selectionWords[Math.floor(Math.random() * selectionWords.length)];
				console.log(word);
		});
		
		/*const allWords = ['AISLE', 'ARGON', 'BERRY', 'BOMBS', 'BORON', 'CALYX',
		'CLOCK', 'COMET', 'CRWTH', 'CYBER', 'DAISY', 'EIGHT', 'FENCE', 'FLICK',
		'FONTS', 'FROTH', 'GAMMA', 'GLASS', 'GREEN', 'HEXES', 'HOVER', 'HYRAX',
		'ICILY', 'INDEX', 'INFER', 'JADED', 'JAZZY', 'JNANA', 'JUICE', 'KIOSK',
		'KOALA', 'LAPIS', 'LARCH', 'LASER', 'LEMON', 'LEVEL', 'LIGHT', 'LOLLY',
		'LOUSY', 'LUNAR', 'MAGIC', 'MAJOR', 'MICRO', 'MORSE', 'NEXUS', 'NORTH',
		'NYMPH', 'OCTAL', 'PECAN', 'PRISM', 'PYXIS', 'QUEUE', 'QUERY', 'RADAR',
		'RADII', 'RAMEN', 'REALM', 'RIDGE', 'RIGHT', 'RIVER', 'ROGUE', 'SEVEN',
		'SIGIL', 'SOUTH', 'SPACE', 'SPARK', 'STARS', 'SYNTH', 'THREE', 'TOQUE',
		'UNIFY', 'VALOR', 'VAULT', 'VENUS', 'VIPER', 'VISTA', 'WALTZ', 'WATER',
		'WHISK', 'XENON', 'XERUS', 'XYLEM', 'YACHT', 'ZILCH'];*/
		//const allWords = ['AQUA', 'BLUE', 'GOLD', 'GREY', 'LIME', 'MINT', 'PINK', 'ROSE'];
		//const word = allWords[Math.floor(Math.random() * allWords.length)];
		
		function countWhite(guess)
		{
			let white = 0;
			let indices = [];
			for(let i = 0; i < guess.length; i++)
			{
				if(word.includes(guess[i]) && guess[i] !== word[i])
				{
					for(let j = 0; j < word.length; j++)
					{
						if(guess[j] !== word[j] && guess[i] === word[j] && !indices.includes(j))
						{
							indices.push(j);
							white++;
							break;
						}
					}
				}
			}
			return white;
		}
		function countRed(guess)
		{
			let red = 0;
			for(let i = 0; i < word.length; i++)
			{
				if(word[i] === guess[i])
				{
					red++;
				}
			}
			return red;
		}
		
		function resetmsg()
		{
			errmsgs.value = errmsgs.value.slice(1);
			console.log(errmsgs.value);
		}
		
		function handleKeyUp(keychar)
		{
			if(!solved.value)
			{
				if(keychar === 'Backspace')
				{
					curguess.value = curguess.value.slice(0, curguess.value.length - 1);
				}
				else if(keychar === 'Enter' && curguess.value.length === word.length && curguessnum.value <= maxguesses && validWords.includes(curguess.value))
				{
					guesses.value.push(curguess.value);
					curguessnum.value++;
					
					if(curguess.value == word)
					{
						solved.value = true;
						errmsgs.value.push("Congratulations!");
						active = false;
					}
					else if(curguessnum.value > maxguesses)
					{
						errmsgs.value.push("The word was " + word);
						active = false;
					}
					
					curguess.value = '';
				}
				else if(curguess.value.length < word.length && keychar.length === 1)
				{
					if(keychar.toLowerCase().charCodeAt(0) >= 97 && keychar.toLowerCase().charCodeAt(0) <= 122)
					{
						curguess.value += keychar.toUpperCase();
					}
				}
				else if(keychar === 'Enter' && active)
				{
					if(curguess.value.length < word.length)
					{
						errmsgs.value.push("Not enough letters");
					}
					else if(!validWords.includes(curguess.value))
					{
						errmsgs.value.push("Not in word list");
					}
					errtimeout = setTimeout(resetmsg, 2000);
				}
			}
		}
		
		window.addEventListener('keyup', (e) => {
			handleKeyUp(e.key);
		});
		
		function isGuessCorrect(guess)
		{
			if(word === guess)
			{
				return true;
			}
			return false;
		}
		
		var col1vals = [];
		var col2vals = [];
		for(let i = 1; i <= maxguesses; i++)
		{
			if(i <= Math.ceil(maxguesses/2))
			{
				col1vals.push(i);
			}
			else
			{
				col2vals.push(i);
			}
		}
		
		return { numChars, maxguesses, curguessnum, guesses, countWhite, countRed, curguess, solved, isGuessCorrect, handleKeyUp, col1vals, col2vals, errmsgs };
	},
	template: `<div class="container-fluid">
		<div v-for="(errmsg, index) in errmsgs"><div :class="(errmsg[0] === 'T' ? 'errmsg errmsg-nofade' : 'errmsg')" :style="{top: (index+2)*40 + 'px'}">{{errmsg}}</div></div>
		<div class="row">
			<div class="col-lg-1 col-md-0 col-sm-0"></div>
			<div v-if="maxguesses > 8" class="col-lg-5 col-md-6 col-sm-12 guessgrid-col">
				<table class="guessgrid">
					<tr v-for="i in col1vals" :class="(i > curguessnum || (i === curguessnum && solved) ? 'unguessed' : (i < curguessnum ? (isGuessCorrect(guesses[i-1]) ? 'guessed correct' : 'guessed') : ''))">
						<td v-for="j in numChars">{{ i < curguessnum ? guesses[i-1][j-1] : (i === curguessnum && j <= curguess.length ? curguess[j-1] : '') }}</td>
						<td class="col-divider"></td>
						<td class="score-0">{{ i <= guesses.length ? countWhite(guesses[i-1]) : ''}}</td>
						<td class="score-1">{{ i <= guesses.length ? countRed(guesses[i-1]) : ''}}</td>
					</tr>
				</table>
			</div>
			<div v-if="maxguesses > 8" class="col-lg-5 col-md-6 col-sm-12 guessgrid-col">
				<table class="guessgrid">
					<tr v-for="i in col2vals" :class="(i > curguessnum || (i === curguessnum && solved) ? 'unguessed' : (i < curguessnum ? (isGuessCorrect(guesses[i-1]) ? 'guessed correct' : 'guessed') : ''))">
						<td v-for="j in numChars">{{ i < curguessnum ? guesses[i-1][j-1] : (i === curguessnum && j <= curguess.length ? curguess[j-1] : '') }}</td>
						<td class="col-divider"></td>
						<td class="score-0">{{ i <= guesses.length ? countWhite(guesses[i-1]) : ''}}</td>
						<td class="score-1">{{ i <= guesses.length ? countRed(guesses[i-1]) : ''}}</td>
					</tr>
				</table>
			</div>
			<div v-else class="col-lg-10 col-md-12 col-sm-12 guessgrid-col">
				<table class="guessgrid">
					<tr v-for="i in maxguesses" :class="(i > curguessnum || (i === curguessnum && solved) ? 'unguessed' : (i < curguessnum ? (isGuessCorrect(guesses[i-1]) ? 'guessed correct' : 'guessed') : ''))">
						<td v-for="j in numChars">{{ i < curguessnum ? guesses[i-1][j-1] : (i === curguessnum && j <= curguess.length ? curguess[j-1] : '') }}</td>
						<td class="col-divider"></td>
						<td class="score-0">{{ i <= guesses.length ? countWhite(guesses[i-1]) : ''}}</td>
						<td class="score-1">{{ i <= guesses.length ? countRed(guesses[i-1]) : ''}}</td>
					</tr>
				</table>
			</div>
			<div class="col-lg-1 col-md-0 col-sm-0"></div>
			<div class="col-lg-12 col-md-12 col-sm-12 keyboard-col d-flex align-items-center">
				<div class="keyboard">
					<button v-for="char in 'QWERTYUIOP'" class="keychar btn btn-secondary" @click="handleKeyUp(char)">{{char}}</button><br />
					<button v-for="char in 'ASDFGHJKL'" class="keychar btn btn-secondary" @click="handleKeyUp(char)">{{char}}</button><br />
					<button class="keychar keychar-enter btn btn-secondary" @click="handleKeyUp('Enter')"><span>ENTER</span></button>
					<button v-for="char in 'ZXCVBNM'" class="keychar btn btn-secondary" @click="handleKeyUp(char)">{{char}}</button>
					<button class="keychar keychar-backspace btn btn-secondary" @click="handleKeyUp('Backspace')"><span>⌫</span></button>
				</div>
			</div>
		</div>
	</div>`
}