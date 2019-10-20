console.log('pagescript');

// @ts-ignore
if (window[ 'rxap_on_load_form_template' ]) {
  console.log('rxap_on_load_form_template');
// @ts-ignore
  window[ 'rxap_on_load_form_template' ]((formId: string, template: string) => {
    window.postMessage({ rxap: true, formId, template }, '*');
  });
}

// @ts-ignore
if (window[ 'rxap_get_all_loaded_form_templates' ]) {
  console.log('rxap_get_all_loaded_form_templates');
// @ts-ignore
  window[ 'rxap_get_all_loaded_form_templates' ]((formId: string, template: string) => {
    window.postMessage({ rxap: true, formId, template }, '*');
  });
}

window.postMessage({ rxap: true, formId: 'test', template: 'tst' }, '*');

document.body.style.backgroundColor = 'red';
