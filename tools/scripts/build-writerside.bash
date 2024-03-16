#!/bin/bash

# region extract all writerside instances

# exit with non-zero status if the Writerside folder does not exist in the current directory
if [ ! -d "Writerside" ]; then
  echo "Writerside folder does not exist in the current directory"
  exit 1
fi

# iterate over each file in the current directory the has the file extension .tree and write the file name in the list of instances
for file in Writerside/*.tree; do
  # extract the instance name from the file name
  instance=$(basename $file .tree)
  # add the instance name to the list of instances
  instances+=($instance)
done

# print the list of instances
echo "Instances: ${instances[@]}"

# endregion

# iterate over each instance
for instance in "${instances[@]}"; do

  INSTANCE_ID="$instance"

  export INSTANCE="Writerside/${INSTANCE_ID,,}"
  export ARTIFACT="webHelp${INSTANCE_ID^^}2-all.zip"
  export DIST_DIR="$CI_PROJECT_DIR/dist/writerside/$INSTANCE_ID"

  echo ""
  echo "INSTANCE_ID: $INSTANCE_ID"
  echo "INSTANCE: $INSTANCE"
  echo "ARTIFACT: $ARTIFACT"
  echo "DIST_DIR: $DIST_DIR"

  # check if the idea.sh build tool is installed
  if [ ! -f "/opt/builder/bin/idea.sh" ]; then
    echo "idea.sh build tool is not installed"
    exit 1
  fi

  set -e
  export DISPLAY=:99
  Xvfb :99 &
  echo "Run helpbuilderinspect for instance >$INSTANCE< to generate artifact file >$ARTIFACT<"
  /opt/builder/bin/idea.sh helpbuilderinspect -source-dir "$CI_PROJECT_DIR" -product $INSTANCE --runner gitlab -output-dir "$DIST_DIR" || true
  echo "Test existing of >$DIST_DIR/$ARTIFACT< artifact"
  test -e "$DIST_DIR"/"$ARTIFACT"
  cd "$DIST_DIR"
  echo "Unzip >$ARTIFACT<"
  unzip -O UTF-8 "$ARTIFACT"

  echo "DONE"

done


