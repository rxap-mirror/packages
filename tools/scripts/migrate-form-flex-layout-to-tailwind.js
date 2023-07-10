const fs = require('fs');
const path = require('path');
const { load } = require('cheerio');
const { join } = path;

const mainAxisMap = {
  'start': 'justify-start',
  'center': 'justify-center',
  'end': 'justify-end',
  'space-around': 'justify-around',
  'space-between': 'justify-between',
  'space-evenly': 'justify-evenly',
};

const crossAxisMap = {
  'start': 'items-start',
  'center': 'items-center',
  'end': 'items-end',
  'baseline': 'items-baseline',
  'stretch': 'items-stretch',
};

const fxAttributes = [
  'fxFill',
  'fxLayout',
  'fxLayoutAlign',
  'fxGap',
  'fxFlex',
];

function convertFlexLayoutToTailwind(filePath) {
  const html = fs.readFileSync(
    filePath,
    'utf-8',
  );
  return extractHtmlTags(html)
    .reduce(
      (
        html,
        tag,
      ) => html.replace(
        tag,
        convertTag(tag),
      ),
      html,
    );
}

function addMainAxisClass(
  $element,
  mainAxis,
) {
  if (!mainAxis || mainAxis === 'start') {
    return;
  }
  if (mainAxisMap[mainAxis]) {
    $element.addClass(mainAxisMap[mainAxis]);
    return;
  } else {
    if (mainAxis.startsWith('{{')) {
      console.log('detected dynamic main axis');
      return;
    }
  }
  console.log(`unknown main axis '${ mainAxis }'`);
}

function addCrossAxisClass(
  $element,
  crossAxis,
) {
  if (!crossAxis || crossAxis === 'start') {
    return;
  }
  if (crossAxisMap[crossAxis]) {
    $element.addClass(crossAxisMap[crossAxis]);
    return;
  } else {
    if (crossAxis.startsWith('{{')) {
      console.log('detected dynamic main axis');
      return;
    }
  }
  console.log(`unknown cross axis '${ crossAxis }'`);
}

function convertTag(tag) {
  if (!fxAttributes.some(a => tag.includes(a))) {
    return tag;
  }

  const $ = load(
    tag,
    {
      xmlMode: true,
      decodeEntities: false,
    },
  );

  $('[fxLayout], [fxLayoutGap], [fxLayoutAlign]')
    .each((
      _,
      element,
    ) => {
      const $element = $(element);

      const fxLayout = $element.attr('fxLayout');
      const fxLayoutGap = $element.attr('fxLayoutGap');
      const fxLayoutAlign = $element.attr('fxLayoutAlign');

      if (fxLayout) {
        convertFxLayoutToTailwind(
          $element,
          fxLayout,
        );
      }

      if (fxLayoutGap) {
        convertFxLayoutGapToTailwind(
          $element,
          fxLayout,
          fxLayoutGap,
        );
      }

      if (fxLayoutAlign) {
        const [ mainAxis, crossAxis ] = fxLayoutAlign.split(' ');

        addMainAxisClass(
          $element,
          mainAxis,
        );
        addCrossAxisClass(
          $element,
          crossAxis,
        );
        $element.removeAttr('fxLayoutAlign');

      }
    });

  $('[fxFlex]')
    .each((
      _,
      elem,
    ) => {
      let fxFlex = $(elem)
        .attr('fxFlex');

      if (!fxFlex) {
        $(elem)
          .addClass(`flex-1`)
          .removeAttr('fxFlex');
        return;
      }

      let flexClassList = [];
      if (!isNaN(Number(fxFlex))) {
        let widthClass = '';
        switch (Number(fxFlex)) {
          case 0:
            flexClassList.push(
              'flex-grow-0',
              'flex-shrink',
            );
          case 33:
            flexClassList.push(`basis-1/3`);
            break;
          case 66:
            flexClassList.push(`basis-2/3`);
            break;
          case 100:
            flexClassList.push(`basis-full`);
            break;
          default:
            flexClassList.push(`basis-${ percentageToFraction(Number(fxFlex)) }`);
            break;
        }
      } else if (fxFlex.endsWith('px')) {

        const num = Number(fxFlex.slice(
          0,
          -2,
        ));
        const basis = Math.floor(num / 4);
        if (basis > 96) {
          console.log(`fxFlex input '${ fxFlex }' results in to large basis ${ basis }`);
          return;
        }
        if (![
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 60, 64, 72, 80, 96,
        ].includes(basis)) {
          console.log(`fxFlex input '${ fxFlex }' results in invalid basis ${ basis }`);
          return;
        }
        flexClassList.push(`basis-${ basis }`);

      } else {

        switch (fxFlex) {
          case 'grow':
            flexClass = 'flex-grow';
            break;
          case 'nogrow':
            flexClass = 'flex-grow-0';
            break;
        }
      }
      $(elem)
        .removeAttr('fxFlex');
      flexClassList.forEach(flexClass => $(elem)
        .addClass(flexClass));


    });

  $('[fxFill]')
    .each((
      _,
      elem,
    ) => {
      $(elem)
        .addClass(`h-full w-full min-h-full min-w-full`)
        .removeAttr('fxFill');
    });

  let newTag = $.html();
  newTag = newTag.replace(
    /(\W\w+)=""/gm,
    '$1',
  );

  if (newTag.endsWith('/>') && tag.endsWith('/>')) {
    return newTag;
  } else {
    return newTag.slice(
      0,
      -2,
    ) + '>';
  }
}

function convertFxLayoutToTailwind(
  $element,
  fxLayout,
) {
  let [ layout, other ] = (
    fxLayout || 'column'
  ).split(' ');

  let className = '';
  switch (layout) {
    case 'row':
      className = 'flex-row';
      break;
    case 'column':
      className = 'flex-col';
      break;
    case 'row-reverse':
      className = 'flex-row-reverse';
      break;
    case 'column-reverse':
      className = 'flex-col-reverse';
      break;
    default:
      return;
  }

  $element.addClass(`flex ${ className }`);

  if (other === 'wrap') {
    $element.addClass('flex-wrap');
  }

  if (other === 'inline') {
    $element.removeClass('flex');
    $element.addClass('inline-flex');
  }

  $element.removeAttr('fxLayout');
}

function convertFxLayoutGapToTailwind(
  $element,
  fxLayout,
  fxLayoutGap,
) {
  let [ layout ] = (
    fxLayout || 'column'
  ).split(' ');

  if (fxLayoutGap === undefined) {
    return;
  }

  const spacing = Math.ceil(parseFloat(fxLayoutGap) * (
    fxLayoutGap.endsWith('px') ? 1 : 4
  )); // convert from em

  if (layout === 'row') {
    $element.addClass(`space-x-${ spacing }`);
  } else {
    $element.addClass(`space-y-${ spacing }`);
  }

  $element.removeAttr('fxLayoutGap');
}

function gcd(
  a,
  b,
) {
  if (!b) {
    return a;
  }
  return gcd(
    b,
    a % b,
  );
}

function percentageToFraction(percentage) {
  const denominator = 100;
  const numerator = percentage;
  const gcdValue = gcd(
    numerator,
    denominator,
  );
  const simplifiedNumerator = numerator / gcdValue;
  const simplifiedDenominator = denominator / gcdValue;
  return `${ simplifiedNumerator }/${ simplifiedDenominator }`;
}

function extractHtmlTags(html) {
  let openingTags = [];
  let tag = '';
  let inTag = false;
  let quote = null;

  for (const ch of [ ...html ]) {
    if (!inTag && ch === '<') {
      inTag = true;
      tag += ch;
    } else if (inTag) {
      tag += ch;

      if (quote === null && (
        ch === '"' || ch === '\''
      )) {
        quote = ch;
      } else if (quote !== null && ch === quote) {
        quote = null;
      } else if (quote === null && ch === '>') {
        openingTags.push(tag);
        tag = '';
        inTag = false;
      }
    }
  }

  return openingTags;
}

function convertFile(filePath) {
  const convertedData = convertFlexLayoutToTailwind(filePath);
  fs.writeFileSync(
    filePath,
    convertedData,
    'utf-8',
  );
  console.log(`File converted successfully: ${ filePath }`);
}

function processFiles(
  folderPath,
  processFile,
  processFolder,
  level = 0,
) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath)
      .forEach(file => {
        const currentPath = path.join(
          folderPath,
          file,
        );
        if (fs.lstatSync(currentPath)
          .isDirectory()) {

          if (currentPath.endsWith('node_modules') || currentPath.endsWith('dist')) {
            return;
          }

          if (processFiles(
            currentPath,
            processFile,
            processFolder,
            level + 1,
          )) {
            processFolder?.(currentPath);
          }
        } else {
          if (currentPath.endsWith('.html')) {
            processFile(
              currentPath,
              level,
            );
          }
        }
      });
    return true;
  } else {
    return false;
  }
}

throw new Error('This script is not ready yet');

processFiles(
  join(
    __dirname,
    'packages',
    'angular',
  ),
  convertFile
);
