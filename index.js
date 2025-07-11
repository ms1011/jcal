#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const program = new Command();
const DB_FILE = 'schedule.json';

// Helper functions for file I/O
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { schedules: [] };
    } else {
      throw error;
    }
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

program
  .name('jcal')
  .description('A CLI tool to manage schedules and to-do lists.')
  .version('1.0.0');

program
  .command('init')
  .description('Creates an empty schedule.json file if it doesn\'t exist.')
  .action(async () => {
    try {
      const db = await readDB();
      if (db.schedules.length === 0) {
        await writeDB({ schedules: [] });
        console.log(chalk.green('✅ schedule.json created successfully.'));
      } else {
        console.log(chalk.yellow('⚠️ schedule.json already exists and is not empty.'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error creating schedule.json: ${error.message}`));
    }
  });

program
  .command('add <titles...>').description('Adds one or more new schedules. Default to todo type, use -d for detailed.').option('-d, --detailed', 'Create a detailed schedule').option('-t, --time <time>', 'Specify time for detailed schedule (e.g., "Tomorrow 3pm")').option('-c, --content <content>', 'Specify content for detailed schedule').action(async (titles, options) => {
    try {
      const db = await readDB();
      const addedSchedules = [];

      for (const title of titles) {
        const newSchedule = {
          id: uuidv4().substring(0, 8),
          title,
          status: 'pending',
          createdAt: dayjs().toISOString(),
        };

        if (options.detailed) {
          newSchedule.type = 'detailed';
          let { time, content } = options;

          if (!time || !content) {
            console.error(chalk.red(`❌ Error: For detailed schedules, --time and --content are required when adding multiple items. Skipping "${title}".`));
            continue; // Skip this schedule and proceed to the next
          }
          newSchedule.dateTime = time;
          newSchedule.content = content;
        } else {
          newSchedule.type = 'todo';
        }

        db.schedules.push(newSchedule);
        addedSchedules.push(newSchedule);
      }

      await writeDB(db);

      if (addedSchedules.length > 0) {
        console.log(chalk.green('✅ Schedules added successfully!'));
        addedSchedules.forEach(s => {
          console.log(chalk.green(`  - "${s.title}" (ID: ${s.id})`));
        });
      } else {
        console.log(chalk.yellow('No schedules were added.'));
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error adding schedule: ${error.message}`));
    }
  });

program
  .command('list')
  .alias('ls')
  .description('Lists all schedules.')
  .option('--done', 'Show only done items')
  .option('--all', 'Show all items (pending and done)')
  .action(async (options) => {
    try {
      const db = await readDB();
      let schedulesToDisplay = db.schedules;

      if (options.done) {
        schedulesToDisplay = schedulesToDisplay.filter(s => s.status === 'done');
      } else if (!options.all) {
        schedulesToDisplay = schedulesToDisplay.filter(s => s.status === 'pending');
      }

      if (schedulesToDisplay.length === 0) {
        console.log(chalk.blue('No schedules to display.'));
        return;
      }

      // Sort schedules by creation date (newest first)
      schedulesToDisplay.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

      schedulesToDisplay.forEach(schedule => {
        let statusIcon = '';
        let coloredOutput;

        if (schedule.status === 'done') {
          statusIcon = chalk.green('✔');
          coloredOutput = chalk.gray;
        } else {
          statusIcon = chalk.yellow('○');
          coloredOutput = chalk.yellow;
        }

        let typeColor;
        if (schedule.type === 'todo') {
          typeColor = chalk.cyan;
        } else {
          typeColor = chalk.magenta;
        }

        let output = `${statusIcon} ${typeColor(schedule.type.toUpperCase())} [${chalk.white(schedule.id)}] ${chalk.bold(schedule.title)}`;

        if (schedule.type === 'detailed') {
          output += `\n  ${chalk.blue('Time:')} ${schedule.dateTime}`;
          output += `\n  ${chalk.blue('Content:')} ${schedule.content}`;
        }
        output += `\n  ${chalk.blue('Created:')} ${dayjs(schedule.createdAt).format('YYYY-MM-DD HH:mm')}`;

        if (schedule.status === 'done') {
          console.log(chalk.strikethrough(output));
        } else {
          console.log(output);
        }
        console.log(''); // Add an empty line for better separation
      });
    } catch (error) {
      console.error(chalk.red(`❌ Error listing schedules: ${error.message}`));
    }
  });

program
  .command('done <id>')
  .description('Marks the schedule with the given <id> as done.')
  .action(async (id) => {
    try {
      const db = await readDB();
      const scheduleIndex = db.schedules.findIndex(s => s.id === id);

      if (scheduleIndex === -1) {
        console.log(chalk.red(`❌ Error: Schedule with ID '${id}' not found.`));
        return;
      }

      db.schedules[scheduleIndex].status = 'done';
      await writeDB(db);
      console.log(chalk.green(`✅ Schedule with ID '${id}' marked as done.`));
    } catch (error) {
      console.error(chalk.red(`❌ Error marking schedule as done: ${error.message}`));
    }
  });

program
  .command('remove <id>')
  .alias('rm')
  .description('Deletes the schedule with the given <id>.')
  .action(async (id) => {
    try {
      const db = await readDB();
      const scheduleToRemove = db.schedules.find(s => s.id === id);
      const initialLength = db.schedules.length;
      db.schedules = db.schedules.filter(s => s.id !== id);

      if (db.schedules.length === initialLength) {
        console.log(chalk.red(`❌ Error: Schedule with ID '${id}' not found.`));
        return;
      }

      console.log(chalk.green(`✅ Schedule "${scheduleToRemove.title}" (ID: ${id}) removed.`));
    } catch (error) {
      console.error(chalk.red(`❌ Error removing schedule: ${error.message}`));
    }
  });

program
  .command('update <id>')
  .description('Updates an existing schedule.')
  .option('--title <title>', 'New title for the schedule')
  .option('--time <time>', 'New time for detailed schedule')
  .option('--content <content>', 'New content for detailed schedule')
  .action(async (id, options) => {
    try {
      const db = await readDB();
      const scheduleIndex = db.schedules.findIndex(s => s.id === id);

      if (scheduleIndex === -1) {
        console.log(chalk.red(`❌ Error: Schedule with ID '${id}' not found.`));
        return;
      }

      const schedule = db.schedules[scheduleIndex];

      if (options.title) {
        schedule.title = options.title;
      }
      if (options.time && schedule.type === 'detailed') {
        schedule.dateTime = options.time;
      }
      if (options.content && schedule.type === 'detailed') {
        schedule.content = options.content;
      }

      await writeDB(db);
      console.log(chalk.green(`✅ Schedule with ID '${id}' updated.`));
    } catch (error) {
      console.error(chalk.red(`❌ Error updating schedule: ${error.message}`));
    }
  });

program.parse(process.argv);
