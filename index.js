#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const fs = require('fs');

program
  .version('1.0.0')
	.description('TODO app');	

function load(done) {
	fs.readFile('store.json', (error, data)=> {
		if (error) {
			if (error.code === 'ENOENT') {
				return done(null, []);
			}	else {
				return done(error);
			}
		}
		try {
			const todosData = JSON.parse(data);
			done(null, todosData);
		} catch (error) {
			done(new Error('Could not convert data')); 
		}
	});
}

function save(todosData,done) {
	try {
		const json = JSON.stringify(todosData);
		fs.writeFile('store.json', json, error => {
			if (error)	return done(error);

			done();
		});
	} catch (error) {
		done(error);
	}
}

function readTodos(done) {
	load(done);
}

function showTodo(id, done) {
	load((error, todosData)=> {
		if (error)	return done(error);

		const todo = todosData.find(todo => todo.id === id);

		if (!todo) return done(new Error('TODO item not found.'));

		done(null, todo)
	});
}

function createTodo(answers, done) {
	load((error, todosData)=> {
		if (error)	return done(error);

		const id = guid();
		todosData.push({id: id, title: answers.title, description: answers.description, islike: false, comment: ""});
		
		save(todosData,done);

		console.log('ID of new TODO: ', id);
	});
}

function updateTodo(answers, id, done) {
	load((error, todosData)=> {
		if (error)	return done(error);

		const index = todosData.findIndex(todo => todo.id === id);

		let todoComment = todosData[index].comment;
		let todoIslike = todosData[index].islike;
		let todoId = todosData[index].id;
		todosData.splice(index, 1, {id: todoId, title: answers.title, description: answers.description, islike: todoIslike, comment: todoComment});
		save(todosData,done);

		console.log('ID of updated TODO: ', id);
	});
}

function removeTodo(id, done) {
	load((error, todosData)=> {
		if (error)	return done(error);

		todosData = todosData.filter(todo => todo.id !== id);

		save(todosData,done);

		//??
	});
}

function likeTodo(id, done) {
	load((error, todosData)=> {
		if (error)	return done(error);

		const index = todosData.findIndex(todo => todo.id === id);

		let todoTitle = todosData[index].title;
		let todoDescription = todosData[index].description;
		let todoComment = todosData[index].comment;

		todosData.splice(index, 1, {id: id, title: todoTitle, description: todoDescription, islike: true, comment: todoComment });
		
		save(todosData,done);

		console.log('ID of liked TODO: ', id);
	});
}

function unlikeTodo(id, done) {
	load((error, todosData)=> {
		if (error)	return done(error);

		const index = todosData.findIndex(todo => todo.id === id);

		let todoTitle = todosData[index].title;
		let todoDescription = todosData[index].description;
		let todoComment = todosData[index].comment;

		todosData.splice(index, 1, {id: id, title: todoTitle, description: todoDescription, islike: false, comment: todoComment });
		save(todosData,done);

		console.log('ID of unliked TODO: ', id);
	});
}

function commentTodo(answers, id, done) {
	load((error, todosData)=> {
		if (error)	return done(error);

		const index = todosData.findIndex(todo => todo.id === id);

		let todoTitle = todosData[index].title;
		let todoDescription = todosData[index].description;
		let todoIslike = todosData[index].islike;

		todosData.splice(index, 1, {id: id, title: todoTitle, description: todoDescription, islike: todoIslike, comment: answers.comment });
		save(todosData,done);

		console.log('ID of commented TODO:',id);
	});
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const createQuestions = [
  {
    type : 'input',
    name : 'title',
    message : 'Enter title ...'
  },
  {
    type : 'input',
    name : 'description',
    message : 'Enter description ...'
	},
];

const updateQuestions = [
  {
    type : 'input',
    name : 'title',
    message : 'Enter new title ...'
  },
  {
    type : 'input',
    name : 'description',
    message : 'Enter new description ...'
  },
];

const commentQuestions = [
  {
    type : 'input',
    name : 'comment',
    message : 'Enter comment ...'
  },
];

program
  .command('list')
  .alias('ls')
  .description('List all TODOs')
  .action((done) => {
		readTodos((error, todosData) => {
			if (error)	return console.error(error.message);

			todosData.forEach((todo, id) => console.log(`id: ${todo.id}\r\nTitle: ${todo.title}\r\nLiked: ${todo.islike}\r\nComment: ${todo.comment}\r\n\r\n --- \r\n`));
		})
	});

program
  .command('show <id>')
  .alias('sh')
  .description('Show TODO by id')
  .action((id) => {
		showTodo(id, (error, todo) => {
			if (error)	return console.error(error.message);

			console.log(`id: ${todo.id}\r\n---\r\nTitle: ${todo.title}\r\nDescription: ${todo.description}\r\n---\r\nIs liked: ${todo.islike}\r\nComment: ${todo.comment}`);
		});
	});

program
	.command('create')
	.alias('cr')
  .description('Create new TODO item')
  .action(() => {
		let answers;

		prompt(createQuestions)
      .then((receivedAnswers) => {
				answers = receivedAnswers;
        return createTodo(answers, error => {
					if (error)	return console.error(error.message);

					console.log('TODO created!')
				});
			})
  });

	program
  .command('update <id>')
  .alias('upd')
  .description('Update TODO item')
  .action((id) => {
		let answers;

		prompt(updateQuestions)
      .then((receivedAnswers) => {
				answers = receivedAnswers;
        return updateTodo(answers, id, error => {
					if (error)	return console.error(error.message);

					console.log('TODO updated!')
				});
			})
  });

program
  .command('remove <id>')
  .alias('rm')
  .description('Remove TODO item by id')
  .action((id) => {
		removeTodo(id, error => {
			
			if (error) return console.error(error.message);

			console.log('TODO removed');
		});
	});

program
  .command('like <id>')
  .alias('lk')
  .description('Add TODO item to favorite')
  .action((id) => {
    likeTodo(id, error => {
			if (error)	return console.error(error.message);

			console.log('TODO liked!')
		});
	});

	program
  .command('unlike <id>')
  .alias('unlk')
  .description('Remove TODO item from favorite')
  .action((id) => {
    unlikeTodo(id, error => {
			if (error)	return console.error(error.message);

			console.log('TODO unliked!')
		});
	});

	program
  .command('comment <id>')
  .alias('cmt')
  .description('Comment TODO item')
  .action((id) => {
		let answers;

    prompt(commentQuestions)
      .then((receivedAnswers) => {
				answers = receivedAnswers;
        return commentTodo(answers, id, error => {
					if (error)	return console.error(error.message);

					console.log('TODO commented!')
				});
			})
  });

program.parse(process.argv);