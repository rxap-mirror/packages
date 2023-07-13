function getChangedNxProjects() {

  # Get the list of changed projects using lerna changed command
  changed_projects=$(yarn lerna changed --json | jq -r '.[] | .location')

  # Initialize an empty array to store the nx project names
  declare -a nx_project_names

  # Iterate over the changed projects
  for project_location in $changed_projects
  do
    # Parse the project.json file to get the nx project name
    nx_project_name=$(jq -r '.name' ${project_location}/project.json)

    # Add the nx project name to the array
    nx_project_names+=($nx_project_name)
  done

  # Convert the array of nx project names into a comma separated string
  nx_project_names_string=$(IFS=','; echo "${nx_project_names[*]}")

  # Output the string of comma-separated project names
  echo "$nx_project_names_string"

}
