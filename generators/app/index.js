const Generator = require("yeoman-generator"),
    path = require("path"),
    glob = require("glob");

module.exports = class extends Generator {
    prompting() {
        return this.prompt([
            {
                type: "input",
                name: "namespace",
                message: "Which namespace do you want to use?",
                validate: (s) => {
                    if (/^[a-zA-Z0-9_\.]*$/g.test(s)) {
                        return true;
                    }
                    return "Please use alpha numeric characters and dots only for the namespace.";
                },
                default: "com.myorg",
            },
            {
                type: "input",
                name: "appname",
                message: "How do you want to name this app name?",
                validate: (s) => {
                    if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
                        return true;
                    }
                    return "Please use alpha numeric characters only for the project name.";
                },
                default: "myUI5App",
            },
            {
                type: "input",
                name: "entitynameplural",
                message: "Entity name (plurals)?",
                validate: (s) => {
                    if (/^[a-zA-Z0-9_\.]*$/g.test(s)) {
                        return true;
                    }
                    return "Please use alpha numeric characters only for the view name.";
                },
                default: "MainView",
            },
            {
                type: "input",
                name: "entitynamesingolar",
                message: "Entity name (singolar)?",
                validate: (s) => {
                    if (/^[a-zA-Z0-9_\.]*$/g.test(s)) {
                        return true;
                    }
                    return "Please use alpha numeric characters only for the view name.";
                },
                default: "MainView",
            },
            {
                type: "confirm",
                name: "newdir",
                message: "Would you like to create a new directory for the project?",
                default: true,
            },
        ]).then((answers) => {
            if (answers.newdir) {
                this.destinationRoot(`${answers.namespace}.${answers.appname}`);
            }
            this.config.set(answers);
        });
    }

    writing() {
        const namespace = this.config.get("namespace");
        const appname = this.config.get("appname");
        const entityNamePlural = this.config.get("entitynameplural");

        this.config.set("namespaceURI", namespace.split(".").join("/"));

        this.sourceRoot(path.join(__dirname, "templates"));
        glob.sync("**", {
            cwd: this.sourceRoot(),
            nodir: true,
        }).forEach((file) => {
            const sOrigin = this.templatePath(file);
            const sTarget = this.destinationPath(file.replace(/\$appname/, appname));

            this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
        });

        const stringifyObject = require("stringify-object");

        let window = [];
        const configFile = this.readDestination("../flpConfig.js");
        const config = eval(configFile);

        config.applications[`${entityNamePlural}-manage`] = {
            title: `Manage ${entityNamePlural}`,
            description: `${entityNamePlural} Maintenance`,
            icon: "sap-icon://add",
            additionalInformation: `SAPUI5.Component=${namespace}.${appname}`,
            applicationType: "URL",
            url: `./${namespace}.${appname}/webapp`,
            navigationMode: "embedded"
        }

        let configString =
            'window["sap-ushell-config"] = ' +
            stringifyObject(config, {
                indent: "    ",
                singleQuotes: false,
            });

        this.writeDestination("../flpConfig.js", configString);

        this.fs.append(this.destinationPath("../index.cds"), `using from './${namespace}.${appname}/fiori-${appname}-UI';`);

        // const oSubGen = Object.assign({}, this.config.getAll());
        // oSubGen.isSubgeneratorCall = true;
        // oSubGen.cwd = this.destinationRoot();

        // this.composeWith(require.resolve("../newview"), oSubGen);
        // const selectedPlatform = this.config.get("platform");
        // if (selectedPlatform !== "Static webserver") {
        //     this.composeWith(require.resolve("../approuter"), oSubGen);
        //     if (selectedPlatform === "Cloud Foundry HTML5 Application Repository") {
        //         this.composeWith(require.resolve("../deployer"), oSubGen);
        //     }
        //     if (selectedPlatform === "Fiori Launchpad on Cloud Foundry") {
        //         this.composeWith(require.resolve("../deployer"), oSubGen);
        //         this.composeWith(require.resolve("../launchpad"), oSubGen);
        //     }
        // }
    }

    install() {
        this.installDependencies({
            bower: false,
            npm: true,
        });
    }

    end() {
        // this.spawnCommandSync("git", ["init", "--quiet"], {
        //     cwd: this.destinationPath()
        // });
        // this.spawnCommandSync("git", ["add", "."], {
        //     cwd: this.destinationPath()
        // });
        // this.spawnCommandSync("git", ["commit", "--quiet", "--allow-empty", "-m", "Initialize repository with easy-ui5"], {
        //     cwd: this.destinationPath()
        // });
    }
};
