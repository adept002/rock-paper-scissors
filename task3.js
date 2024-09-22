const crypto = require('crypto');
const readline = require('readline');
const Table = require('cli-table3');

// Класс для генерации ключа
class KeyGenerator{
   static generateKey(){
      return crypto.randomBytes(32); // 256 бит = 32 байта
   }
}

// Класс для генерации HMAC
class HMACGenerator{
   static generateHMAC(key, message){
      return crypto.createHmac('sha256', key).update(message).digest('hex');
   }
}

// Класс для определения правил игры
class GameRules{
   constructor(moves){
      this.moves = moves;
      this.results = this.generateResultsTable();
   }

   generateResultsTable(){
      const table = Array.from({ length: this.moves.length }, () => Array(this.moves.length).fill('Draw'));
      for (let i = 0; i < this.moves.length; i++){
         for (let j = 0; j < this.moves.length; j++){
            if (i !== j){
               table[i][j] = (j === (i + 1) % this.moves.length) ? 'Lose' : 'Win';
            }
         }
      }
      return table;
   }

   displayHelp(){
      const table = new Table({
         head: [' '] + this.moves,
         colWidths: Array(this.moves.length + 1).fill(10)
      });

      for (let i = 0; i < this.moves.length; i++){
         const row = [this.moves[i]].concat(this.results[i]);
         table.push(row);
      }

      console.log('Таблица результатов:');
      console.log(table.toString());
   }

   determineOutcome(userMove, computerMove){
      const userIndex = this.moves.indexOf(userMove);
      const computerIndex = this.moves.indexOf(computerMove);
      return this.results[userIndex][computerIndex];
   }
}

// Главный класс игры
class Game{
   constructor(){
      this.moves = ['Камень', 'Ножницы', 'Бумага'];
      this.rules = new GameRules(this.moves);
      this.history = []; // История результатов игры
      this.userScore = 0; // Счет пользователя
      this.computerScore = 0; // Счет компьютера
      this.roundsPlayed = 0; // Количество сыгранных раундов
      this.maxRounds = 7; // Максимальное количество раундов
   }

   start(){
      console.log(`Игра началась! Всего раундов: ${this.maxRounds}`);
      this.play();
   }

   play(){
      if (this.roundsPlayed >= this.maxRounds){
         return this.endGame();
      }

      const key = KeyGenerator.generateKey();
      const computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
      const hmac = HMACGenerator.generateHMAC(key, computerMove);

      console.log(`HMAC: ${hmac}`);
      this.showMenu(key, computerMove);
   }

   showMenu(key, computerMove){
      console.log('Меню:');
      console.log('1 - Камень');
      console.log('2 - Ножницы');
      console.log('3 - Бумага');
      console.log('0 - Выход');
      console.log('? - Помощь');

      const rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout
      });

      rl.question('Ваш выбор: ', (input) => {
         if (input === '?'){
            this.rules.displayHelp();
            rl.close();
            return this.showMenu(key, computerMove);
         }

         const choice = parseInt(input, 10);
         
         if (choice < 0 || choice > 3 || isNaN(choice)){
            console.log('Неверный выбор. Попробуйте снова.');
            rl.close();
            return this.showMenu(key, computerMove);
         }

         if (choice === 0){
            console.log('Спасибо за игру!');
            rl.close();
            return;
         }

         const userMove = this.moves[choice - 1];
         const outcome = this.rules.determineOutcome(userMove, computerMove);
            
         if (outcome === 'Win'){
            this.userScore++;
         }else if (outcome === 'Lose'){
            this.computerScore++;
         }

         this.history.push({
            userMove,
            computerMove,
            outcome,
            key: key.toString('hex')
         });

         this.roundsPlayed++;
         this.displayHistory();
         rl.close();
         this.play(); // Запускаем новую игру
      });
   }
 
   displayHistory(){
      const color = {
         blue: '\u001b[34m'
      };
      const table = new Table({
         head: ['№', 'Ваш ход', 'Ход компьютера', 'Исход', 'Ключ'],
         colWidths: [5, 15, 20, 10, 66],
         style: ['blue'] 
      });

      this.history.forEach((entry, index) => {
         table.push([`${color.blue}${index + 1}`, entry.userMove, entry.computerMove, entry.outcome, entry.key]);
      });

      console.log('История игр:');
      console.log(table.toString());
   }

   endGame() {
      console.log(`Игра окончена!`);
      console.log(`Ваш счет: ${this.userScore}`);
      console.log(`Счет компьютера: ${this.computerScore}`);
        
      if (this.userScore > this.computerScore){
         console.log('Вы выиграли!');
      }else if (this.userScore < this.computerScore) {
         console.log('Вы проиграли.');
      }else {
         console.log('Ничья!');
      }
   }
}

// Запуск игры
const game = new Game();
game.start(); 
