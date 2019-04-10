const {Command, flags} = require('@oclif/command');
const {promisify} = require('util');
const fs = require('fs');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const populateChildren = (x, recordLookup, visited) =>
      {
          const replaceTypeWithLookup = t => {
              if ((typeof t) == "string") {
                  if (recordLookup[t] && !visited.has(t)) {
                      return populateChildren(recordLookup[t], recordLookup, visited.add(t));
                  } 
              } else if (t.type == "array" && t.items) {
                  return Object.assign({}, t, {items: replaceTypeWithLookup(t.items)})
              } else if (t.type == "map" && t.values) {
                  return Object.assign({}, t, {values: replaceTypeWithLookup(t.values)})
              }
              else if (Array.isArray(t)) {
                  return t.map(unionType => replaceTypeWithLookup(unionType));
              }
              return t;
          };
          const replaceFieldWithLookup = f => {
              return Object.assign({}, f, {type: replaceTypeWithLookup(f.type)});
          }
          x.fields = x.fields.map(replaceFieldWithLookup);
          return x
      }


class AvroStitchCommand extends Command {
    async run() {
        const {flags} = this.parse(AvroStitchCommand);
        const recordLookup = (await Promise.all((await readdir(flags.directory[0]))
                                      .filter(x => x.endsWith('.avsc'))
                                      .map(x => readFile(`${flags.directory[0]}/${x}` ))))
              .map(x => JSON.parse(x))
              .reduce((result, x) => {
                  result[x.name] = x;
                  return result;
              }, {}) ;


        const result = populateChildren(recordLookup[flags.root], recordLookup, new Set([]));
        if (flags.output) {
            fs.writeFileSync(flags.output, JSON.stringify(result, null, 4));
            
        } else {
            console.log(JSON.stringify(result, null, 4));
        }
    }
}

AvroStitchCommand.description = `Given a directory of avro files, stitch them together, starting with a single entry
`

AvroStitchCommand.flags = {
    directory: flags.string({char: 'd', multiple: true, required: true}),
    root: flags.string({char: 'r', required: true}),
    output: flags.string({char: 'o', required: false}),
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'})
}

module.exports = AvroStitchCommand
