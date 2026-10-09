import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeQuestion, publicQuestion, normalizedText } from '../lib/exams.js';

test('single-choice answer scores points only for exact correct choice', () => {
  const q = { question_type:'single_choice', answer_key:['B'], points:'2' };
  assert.deepEqual(gradeQuestion(q, 'B'), { correct:true, earned:2 });
  assert.deepEqual(gradeQuestion(q, 'A'), { correct:false, earned:0 });
});

test('multi-choice is order independent but requires all correct choices', () => {
  const q = { question_type:'multi_choice', answer_key:['A','C'], points:3 };
  assert.deepEqual(gradeQuestion(q, ['C','A']), { correct:true, earned:3 });
  assert.deepEqual(gradeQuestion(q, ['A']), { correct:false, earned:0 });
  assert.deepEqual(gradeQuestion(q, ['A','B','C']), { correct:false, earned:0 });
});

test('short answer normalizes whitespace and case', () => {
  const q = { question_type:'short_answer', accepted_answers:['  2x ', '2*x'], points:1 };
  assert.equal(gradeQuestion(q, ' 2X ').correct, true);
  assert.equal(gradeQuestion(q, '3x').correct, false);
});

test('public exam projection hides answer key and explanation before submission', () => {
  const q = { id:'1', sort_order:1, prompt:'Q?', question_type:'single_choice', points:1,
    options:[{id:'A',label:'A',text:'One',is_correct:false},{id:'B',label:'B',text:'Two',is_correct:true}],
    answer_key:['B'], explanation:'Explanation text' };
  const pub = publicQuestion(q);
  assert.equal('answerKey' in pub, false);
  assert.equal('answer_key' in pub, false);
  assert.equal('explanation' in pub, false);
  assert.deepEqual(pub.options, [{id:'A',label:'A',text:'One'},{id:'B',label:'B',text:'Two'}]);
  assert.equal(publicQuestion(q, true).explanation, 'Explanation text');
});

test('text normalizer trims and compresses whitespace', () => {
  assert.equal(normalizedText('  ĐÁP ÁN   đúng  '), 'đáp án đúng');
});
