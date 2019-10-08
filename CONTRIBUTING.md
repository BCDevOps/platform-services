# Contributing to Platform Services

#### Table Of Contents

[Code of Conduct](#code-of-conduct)

[Styleguides](#styleguides)
  * [OpenShift Templates Styleguide](#openshift-templates-styleguide)

## Code of Conduct
See [BCDevOps Code Of Conduct](https://github.com/BCDevOps/developer-platform/blob/master/CODE_OF_CONDUCT.md)

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* When only changing documentation, include `[ci skip]` in the commit title
* Consider starting the commit message with an applicable emoji:
    * :art: `:art:` when improving the format/structure of the code
    * :racehorse: `:racehorse:` when improving performance
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks
    * :memo: `:memo:` when writing docs
    * :penguin: `:penguin:` when fixing something on Linux
    * :apple: `:apple:` when fixing something on macOS
    * :checkered_flag: `:checkered_flag:` when fixing something on Windows
    * :bug: `:bug:` when fixing a bug
    * :fire: `:fire:` when removing code or files
    * :green_heart: `:green_heart:` when fixing the CI build
    * :white_check_mark: `:white_check_mark:` when adding tests
    * :lock: `:lock:` when dealing with security
    * :arrow_up: `:arrow_up:` when upgrading dependencies
    * :arrow_down: `:arrow_down:` when downgrading dependencies
    * :shirt: `:shirt:` when removing linter warnings
  
### OpenShift Templates Styleguide

* Use Yaml file and `.yaml` file extension
* Add line comments whenever clarification is needed. The line comment is regarding the immediate line following it.
* `.metadata.name` should follow the following format: `${NAME}[-subcomponent]${SUFFIX}` where `[-subcomponent]` is optional
* Labels:
    * From [Kubernetes Common labes](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/)
       * `app.kubernetes.io/name`: The name of the application
       * `app.kubernetes.io/instance`: A unique name identifying the instance of an application
       * `app.kubernetes.io/version`: The current version of the application (e.g., a semantic version, revision hash, etc.)
       * `app.kubernetes.io/component`: The component within the architecture
       * `app.kubernetes.io/part-of`: The name of a higher level application this one is part of
       * `app.kubernetes.io/managed-by`: The tool being used to manage the operation of an application
    * `app`: This label is used by OpenShift Web Console to group objects together as one stack. Same as `app.kubernetes.io/instance`
* Standard parameters:
    * `NAME`: The name (.metadata.name) used for all produced artifacts. See above for `.metadata.name`
    * `SUFFIX`: A suffix appended to all artifact's name (NAME). Aka instance's name. See above for `.metadata.name`
    * `VERSION`: For build templates, it is the output image tag being produced. For deployment templates, it is the version (image tag) being deployed.
    * `GIT_URI`: URL to the Git repository. Please use HTTP url (as opposed to `git+ssh`)
    * `GIT_REF`: The branch name, commit id, or tag
    * `GIT_DIR`: A directory within the git repository
* Split a templates in 4 files:
  * Build Prerequisites (`build-prereq`): A template for creating/generating `Secret`, `ConfigMap`
  * Build (`build`): A template responsible for creating the necessary objects (e.g.: `ImageStream`, `ImageStreamTag`, `BuildConfig`) for building images
  * Deployment Prerequisites (`deploy-prereq`): A template for creating/generating `Secret`, `ConfigMap`
  * Deployment (`deploy`): A template responsible for creating the necessary objects (e.g.: `ImageStream`, `ImageStreamTag`, `DeploymentConfig`, `Statefulset`, `Service`, `Endpoints`, `Route`) for deploying an application

### Recommended Tagging Conventions
Please refer to https://docs.openshift.com/container-platform/3.11/dev_guide/managing_images.html#tag-naming

