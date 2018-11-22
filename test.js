let taken = []

function randomizer() {
			let random = Math.floor(Math.random()*14)+1 
			while(taken.indexOf(random) !== -1) {
				random = Math.floor(Math.random()*14)+1
			 }
			 if(taken.indexOf(random) == -1) {
				taken.push(random)
				return random
			}	 	
	}

for(i=0;i < 14; i++) {
	console.log(randomizer())
}
