## Configuration Manager

This is a general-purpose Configuration Manager that will read
configuration properties from one or more json files and merge
the properties.  Properties in later-read files will override
existing properties from earlier-read files.

### Usage

```javascript
const Config = require('@dwaring87/config');
```

#### Constructor

The constructor takes an optional default configuration.  This can be provided
as the file path to a JSON file defining the configuration OR a javascript object 
containing the default configuration.  The default configuration can then be 
overridden by adding additional config files/objects.  When the `reset()` function 
is used, the configuration will be reset to include the default configuration 
properties, if a default configuration was given.

Optionally, the constructor can take a parser function to parse the default
configuration after it is read (see **Read Configuration File** below).

```javascript
let config = new Config('/path/to/default.json');
```

#### Get Configuration

This will return an object containing all of the configuration properties.

```javascript
let props = config.get();
```

#### Set Configuration

This can be used to manually set the configuration properties.  This will
replace all existing configuration properties.

```javascript
let props = {
    propA: 'value A',
    propB: 'value B'
};
config.set(props);
```

#### Reset Configuration

This will reset the configuration properties to those in the default
configuration, if provided in the constructor.

```javascript
config.reset();
```

#### Clear Configuration

This will clear all of the configuration properties.

```javascript
config.clear();
```

#### Read Configuration File

This can be used to add the properties of another configuration file
to the existing configuration.  New configuration properties will override
existing configuration properties (with the exception of Arrays, where new
Arrays will be appended to existing Arrays).

Optionally, a parser function can be given which can be used to modify the
configuration properties after they are read from the file.  This function
will take the file's configuration properties as an argument and must return
the modified configuration.

```javascript
// Read new configuration file to merge with existing configuration
config.read('/path/to/config.json');

// Modify the configuration properties after reading
config.read('/path/to/config.json', function(config) {

    // Check for illegal value
    if ( config.propA === 'A' ) {

        // Change value to legal value
        config.propA = 'B';

    }

    // Return the modified config
    return config;

});

```


#### Merge Configuration

This can be used to merge additional configuration properties into the 
existing configuration.  Existing properties will be overwritten and new 
properties will be added.

Optionally, a parser function can be given which can be used to modify the
configuration properties after they are read from the file.  This function
will take the file's configuration properties as an argument and must return
the modified configuration.

```javascript
// Provide the initial configuration
let config = new Config({
  a: "Old value"
});

// Provide the additional configuration
config.merge({
  a: "New value",
  b: "New property"
});

// Get the new configuration
console.log(config.get());
// { a: 'New value', b: 'New property' }
```
