package com.qa.system.service;

import com.qa.system.dto.QaRequest;
import com.qa.system.entity.Qa;
import com.qa.system.repository.QaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QaService {
    
    private final QaRepository qaRepository;

    public Page<Qa> findAll(Pageable pageable) {
        return qaRepository.findAll(pageable);
    }

    public Qa findById(Long id) {
        return qaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QA not found"));
    }

    @Transactional
    public Qa create(QaRequest request, Long userId) {
        Qa qa = new Qa();
        qa.setQuestion(request.getQuestion());
        qa.setAnswer(request.getAnswer());
        qa.setCategoryId(request.getCategoryId());
        qa.setCreateUserId(userId);
        qa.setSource("MANUAL");
        return qaRepository.save(qa);
    }

    @Transactional
    public Qa update(Long id, QaRequest request) {
        Qa qa = findById(id);
        qa.setQuestion(request.getQuestion());
        qa.setAnswer(request.getAnswer());
        qa.setCategoryId(request.getCategoryId());
        return qaRepository.save(qa);
    }

    @Transactional
    public void delete(Long id) {
        qaRepository.deleteById(id);
    }

    @Transactional
    public void incrementView(Long id) {
        Qa qa = findById(id);
        qa.setViewCount(qa.getViewCount() + 1);
        qaRepository.save(qa);
    }

    @Transactional
    public void incrementLike(Long id) {
        Qa qa = findById(id);
        qa.setLikeCount(qa.getLikeCount() + 1);
        qaRepository.save(qa);
    }
}
